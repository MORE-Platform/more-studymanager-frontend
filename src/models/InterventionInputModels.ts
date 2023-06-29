import cron from 'cron-validate';

export class ValidationError extends Error {
  constructor(public key: string, msg: string) {
    super(msg);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export abstract class TriggerProperty<T> {
  abstract validate(): string | undefined;

  static fromJson(value: any): TriggerProperty<any> {
    console.log('fromJson');
    console.log(value.type);
    switch (value.type) {
      case 'QueryObject':
        return QueryObject.fromJson(value);
      default:
        throw new Error('cannot case property');
    }
  }

  abstract getType(): 'QueryObject' | 'Object' | 'Array' | 'Integer' | 'String';
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

export class QueryObject extends TriggerProperty<QueryObject> {
  nextGroupCondition: string | undefined;
  parameter: QueryObjectInner[];

  constructor(
    nextGroupCondition: string | undefined,
    queryConditions: QueryObjectInner[]
  ) {
    super();
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

export class WindowProp extends TriggerProperty<number> {
  window: number;

  constructor(window: number) {
    super();
    this.window = window;
  }

  getType(): 'Integer' | 'String' {
    return 'Integer';
  }

  validate(): string | undefined {
    if (!this.window) {
      return 'Please be sure to add a value for the window property in seconds.';
    } else if (this.window && this.window < 0) {
      return 'Invalid Property. The window property is not allowed to be below 0.';
    } else return undefined;
  }
}

export class cronScheduler extends TriggerProperty<string> {
  cronSchedule: string;

  constructor(cronSchedule: string) {
    super();
    this.cronSchedule = cronSchedule;
  }

  getType(): 'String' {
    return 'String';
  }

  validate(): string | undefined {
    if (!this.cronSchedule) {
      return 'Please be sure to add a value for the cron schedule to set the intervall of the intervention.';
    } else if (this.cronSchedule) {
      const validCronValue = cron(this.cronSchedule, {
        preset: 'default-preset',
      });
      if (!validCronValue.isValid()) {
        return validCronValue.getError().pop();
      }
    } else return undefined;
  }
}
