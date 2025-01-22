import { useState } from "react";
import * as yup from "yup";

interface FormErrors<T> {
    [key: string]: string | undefined;
}

export function useForm<T extends Record<string, any>>(
    initialValues: T,
    validationSchema: yup.ObjectSchema<any>
) {
    const [formData, setFormData] = useState<T>(initialValues);
    const [errors, setErrors] = useState<FormErrors<T>>({});

    const validateField = async (name: keyof T, value: any): Promise<string | undefined> => {
        try {
            await validationSchema.validateAt(name as string, { ...formData, [name]: value });
            return undefined;
        } catch (validationError) {
            return (validationError as yup.ValidationError).message;
        }
    };

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        const errorMessage = await validateField(name as keyof T, value);
        setErrors((prev) => ({
            ...prev,
            [name]: errorMessage,
        }));
    };

    const validateForm = async (): Promise<boolean> => {
        try {
            await validationSchema.validate(formData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (validationError: any) {
            const newErrors: FormErrors<T> = {};
            if (validationError.inner) {
                validationError.inner.forEach((err: yup.ValidationError) => {
                    if (err.path) newErrors[err.path] = err.message;
                });
            }
            setErrors(newErrors);
            return false;
        }
    };

    return { formData, errors, handleChange, validateForm, setFormData, setErrors };
}
