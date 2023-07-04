import cron from 'cron-validate';

export class ValidationError extends Error {
  constructor(public key: string, msg: string) {
    super(msg);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export abstract class Property<T> {
  id: string;
  name: string;
  description: string;
  defaultValue?: T;
  value?: T;
  required: boolean;
  immutable: boolean;
  abstract validate(): string | undefined;

  static fromJson(value: any): Property<any> {
    switch (value.type) {
      case 'INTEGER':
        return IntegerProperty.fromJson(value);
      case 'STRING':
        return StringProperty.fromJson(value);
      case 'STRINGLIST':
        return StringListProperty.fromJson(value);
      case 'CRON':
        return CronProperty.fromJson(value);
      case 'DATACHECKQUERY':
        return DataCheckProperty.fromJson(value);
      default:
        throw new Error('cannot case property');
    }
  }

  abstract getType():
    | 'Integer'
    | 'Object'
    | 'Array'
    | 'String'
    | 'Boolean'
    | 'Double';

  static toJson(props: Property<any>[]): any {
    const result: any = {};
    props.forEach((item) => {
      //TODO kind of workaround
      if (item.getType() === 'Integer') {
        result[item.id] = parseInt(item.getValue());
      } else {
        result[item.id] = item.getValue();
      }
    });
    return result;
  }

  protected constructor(
    defaultValue: T,
    description: string,
    id: string,
    immutable: boolean,
    name: string,
    required: boolean
  ) {
    this.defaultValue = defaultValue;
    this.description = description;
    this.id = id;
    this.immutable = immutable;
    this.name = name;
    this.required = required;
  }

  public setValue(v: T): Property<T> {
    this.value = v || this.defaultValue;
    return this;
  }

  public getValue(): T | undefined {
    const error = this.validate();
    if (error) {
      throw new ValidationError(this.name, error);
    }
    return this.value;
  }
}

export class StringProperty extends Property<string> {
  regex?: string;

  constructor(
    defaultValue: string,
    description: string,
    id: string,
    immutable: boolean,
    name: string,
    required: boolean,
    regex: string
  ) {
    super(defaultValue, description, id, immutable, name, required);
    this.regex = regex;
  }

  getType(): 'Integer' | 'Object' | 'String' | 'Boolean' | 'Double' {
    return 'String';
  }

  validate(): string | undefined {
    if (this.required && this.value === undefined) {
      return 'Value is required';
    } else if (
      this.regex &&
      this.value &&
      !new RegExp(this.regex).test(this.value)
    ) {
      return 'Value has wrong value';
    } else {
      return undefined;
    }
  }
  static fromJson(json: any): StringProperty {
    return new StringProperty(
      json.defaultValue,
      json.description,
      json.id,
      json.immutable,
      json.name,
      json.required,
      json.regex
    );
  }
}

export class StringListProperty extends Property<string[]> {
  minSize: number;
  maxSize: number;

  constructor(
    defaultValue: string[],
    description: string,
    id: string,
    immutable: boolean,
    name: string,
    required: boolean,
    minSize: number,
    maxSize: number
  ) {
    super(defaultValue, description, id, immutable, name, required);
    this.minSize = minSize;
    this.maxSize = maxSize;
  }

  static fromJson(json: any): StringListProperty {
    return new StringListProperty(
      json.defaultValue,
      json.description,
      json.id,
      json.immutable,
      json.name,
      json.required,
      json.minSize,
      json.maxSize
    );
  }

  public getValue(): string[] | undefined {
    const error = this.validate();
    if (error) {
      throw new ValidationError(this.name, error);
    }
    return this.value?.filter((v) => v !== undefined && v.trim() !== '');
  }

  getType(): 'Integer' | 'Object' | 'Array' | 'String' | 'Boolean' | 'Double' {
    return 'Array';
  }

  validate(): string | undefined {
    if (this.value === undefined && this.required) {
      return 'Value has to be defined';
    }

    let count = 0;
    this.value?.forEach((v) => {
      if (v !== undefined && v.trim() !== '') {
        count += 1;
      }
    });
    if (count < this.minSize) {
      return `At lease ${this.minSize} values must be set`;
    } else {
      return undefined;
    }
  }
}

export class IntegerProperty extends Property<number> {
  min: number;
  max: number;

  constructor(
    defaultValue: number,
    description: string,
    id: string,
    immutable: boolean,
    name: string,
    required: boolean,
    min: number,
    max: number
  ) {
    super(defaultValue, description, id, immutable, name, required);
    this.min = min;
    this.max = max;
  }

  getType(): 'Integer' | 'Object' | 'String' | 'Boolean' | 'Double' {
    return 'Integer';
  }

  validate(): string | undefined {
    if (this.required && this.value === undefined) {
      return 'Value is required';
    } else if (
      this.value !== undefined &&
      (this.min > this.value || this.max < this.value)
    ) {
      return 'Value has wrong value';
    } else return undefined;
  }

  static fromJson(json: any): IntegerProperty {
    return new IntegerProperty(
      json.defaultValue,
      json.description,
      json.id,
      json.immutable,
      json.name,
      json.required,
      json.min,
      json.max
    );
  }
}

export class CronProperty extends Property<string> {
  constructor(
    defaultValue: string,
    description: string,
    id: string,
    immutable: boolean,
    name: string,
    required: boolean
  ) {
    super(defaultValue, description, id, immutable, name, required);
  }

  static fromJson(json: any): CronProperty {
    return new CronProperty(
      json.defaultValue,
      json.description,
      json.id,
      json.immutable,
      json.name,
      json.required
    );
  }

  getType(): 'Integer' | 'Object' | 'String' | 'Boolean' | 'Double' {
    return 'String';
  }

  validate(): string | undefined {
    if (!this.value) {
      return 'Please be sure to add a value for the cron schedule to set the intervall of the intervention.';
    } else if (this.value) {
      const cronValidateValue = this.value.slice(2);
      const validCronValue = cron(cronValidateValue, {
        preset: 'default-preset',
      });
      if (!validCronValue.isValid()) {
        return validCronValue.getError().pop();
      }
    } else return undefined;
  }
}

export class DataCheckProperty extends Property<QueryObject[]> {
  constructor(
    defaultValue: QueryObject[],
    description: string,
    id: string,
    immutable: boolean,
    name: string,
    required: boolean
  ) {
    super(defaultValue, description, id, immutable, name, required);
  }

  static fromJson(json: any): DataCheckProperty {
    return new DataCheckProperty(
      json.defaultValue,
      json.description,
      json.id,
      json.immutable,
      json.name,
      json.required
    );
  }

  getType(): 'Integer' | 'Object' | 'String' | 'Boolean' | 'Double' | 'Array' {
    return 'Object';
  }

  validate(): string | undefined {
    if (!this.value?.length) {
      return 'Please be sure to add at least one additional condition to your trigger.';
    } else if (this.value.length > 0) {
      this.value.forEach((item: QueryObject) => {
        console.error('this.value foreach');

        if (!item.parameter.length) {
          return 'Please be sure to add at least one additional condition to your trigger.';
        } else {
          item.parameter.forEach((p) => {
            if (
              typeof p.operator === 'undefined' ||
              typeof p.observationId === 'undefined' ||
              p.propertyValue === 'undefined' ||
              typeof p.observationProperty === 'undefined' ||
              typeof p.observationType === 'undefined'
            ) {
              return 'Please be sure to set and save all chosen properties.';
            }
          });
        }
      });
    } else return undefined;
  }
}

class QueryObjectInner {
  observationId: number;
  observationType: string;
  observationProperty: string;
  operator: string;
  propertyValue: string | number;
  editMode: boolean | undefined;
  error: boolean | undefined;

  constructor(
    observationId: number,
    observationType: string,
    observationProperty: string,
    operator: string,
    propertyValue: string | number,
    editMode?: boolean,
    error?: boolean
  ) {
    this.observationId = observationId;
    this.observationType = observationType;
    this.observationProperty = observationProperty;
    this.operator = operator;
    this.propertyValue = propertyValue;
    this.editMode = editMode;
    this.error = error;
  }

  getType(): 'Integer' | 'Object' | 'String' | 'Boolean' | 'Double' | 'Array' {
    return 'Object';
  }

  validate(): string | undefined {
    if (
      this.observationId === undefined ||
      this.observationType === undefined ||
      this.observationProperty === undefined ||
      this.operator === undefined ||
      this.propertyValue === undefined
    ) {
      return 'Please fill out required fields.';
    } else if (typeof this.observationId !== 'number') {
      return 'Invalid Type. Observation Id has to be a number';
    } else if (typeof this.observationType !== 'string') {
      return 'Invalid type. Observation type has to be a string.';
    } else if (typeof this.observationProperty !== 'string') {
      return 'Invalid type. Observation property has to be a string.';
    } else if (typeof this.operator !== 'string') {
      return 'Invalid type. Operator has to be a string.';
    } else if (
      typeof this.propertyValue !== 'string' ||
      typeof this.propertyValue !== 'number'
    ) {
      return 'Invalid type. Property value has to be either a string or a number.';
    } else return undefined;
  }

  static fromJson(json: any): QueryObjectInner {
    return new QueryObjectInner(
      json.observationId,
      json.observationType,
      json.observatoinProperty,
      json.operator,
      json.propertyValue,
      json.editMode,
      json.error
    );
  }
}

class QueryObject {
  nextGroupCondition: string | undefined;
  parameter: QueryObjectInner[];

  constructor(
    nextGroupCondition: string | undefined,
    queryConditions: QueryObjectInner[]
  ) {
    this.nextGroupCondition = nextGroupCondition;
    this.parameter = queryConditions;
  }

  getType(): 'QueryObject' | 'Object' | 'Array' {
    return 'QueryObject';
  }

  validate(): string | undefined {
    if (!this.parameter.length) {
      return 'Please be sure to add at least one additional condition to your trigger.';
    } else if (this.parameter.length > 0) {
      this.parameter.forEach((item) => {
        const validate = item.validate();
        if (validate) {
          return validate;
        }
      });
    } else return undefined;
  }

  static fromJson(json: any): QueryObject {
    return new QueryObject(json.nextGroupCondition, json.parameter);
  }
}
