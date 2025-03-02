import { applyDecorators } from "@nestjs/common";
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export function StringValidation(maxLength: number = 255) : PropertyDecorator {
    return applyDecorators(
        IsOptional(),
        IsString(),
        MaxLength(maxLength)
    )
}

export function StringRequiredValidation(maxLength: number = 255) : PropertyDecorator {
    return applyDecorators(
        IsNotEmpty(),
        IsString(),
        MaxLength(maxLength)
    )
}

export function BoolValidation() : PropertyDecorator {
    return applyDecorators(
        IsOptional(),
        IsBoolean()
    )
}

export function BoolRequiredValidation() : PropertyDecorator {
    return applyDecorators(
        IsNotEmpty(),
        IsBoolean()
    )
}

export function IntValidation() : PropertyDecorator {
    return applyDecorators(
        IsOptional(),
        IsInt()
    )
}

export function IntRequiredValidation() : PropertyDecorator {
    return applyDecorators(
        IsNotEmpty(),
        IsInt()
    )
}


export function FloatValidation() : PropertyDecorator {
    return applyDecorators(
        IsOptional(),
        IsNumber()
    )
}

export function FloatRequiredValidation() : PropertyDecorator {
    return applyDecorators(
        IsNotEmpty(),
        IsNumber()
    )
}

export function StringArrayValidator(maxLength: number = 255) : PropertyDecorator {
    return applyDecorators(
        IsArray(),
        IsOptional(),
        IsString({ each: true }),
    )
}

export function StringRequiredArrayValidator(maxLength: number = 255) : PropertyDecorator {
    return applyDecorators(
        IsArray(),
        IsNotEmpty(),
        IsString({ each: true }),
    )
}
