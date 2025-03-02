import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator } from 'class-validator';
import { DataSource } from 'typeorm';
import { Type } from '@nestjs/common';

let dataSource: DataSource;

export function setDataSource(ds: DataSource) {
  dataSource = ds;
}

@ValidatorConstraint({ async: true })
export class IsEntityExistConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [entityClass] = args.constraints;
    
    if (!value || !entityClass || !dataSource) return false;

    try {
      const repository = dataSource.getRepository(entityClass);
      const entity = await repository.findOne({ 
        where: { id: value } as any 
      });
      
      return !!entity;
    } catch (error) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const [entityClass] = args.constraints;
    return `${args.property} does not exist in ${entityClass.name}`;
  }
}

export function IsEntityExist(entityClass: Type<any>) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEntityExist',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [entityClass],
      validator: IsEntityExistConstraint,
      async: true
    });
  };
}