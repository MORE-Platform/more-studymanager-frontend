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
      throw new Error(error);
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
      throw new Error(error);
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
      if (v === undefined || v.trim() === '') {
        count += 1;
      }
    });

    if (this.required && count < this.minSize) {
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
