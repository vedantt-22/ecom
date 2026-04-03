export interface ValidationError {
    field: string // the name of the field that failed validation
    message: string // a human-friendly error message describing the problem
}

export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): boolean {
    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password)
    );
}

export function validateInput(input: string): string {
 return input.trim().replace(/[<>'"]/g, "");
}

export function validateRegistrationInput(name: string, email: string, password: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if(!name || validateInput(name) === '') {
        errors.push({
            field: 'name',
            message: 'Name is required and cannot be empty.'
        });
    }

    if(!email || !validateEmail(email)) {
        errors.push({
            field: 'email',
            message: 'A valid email is required.'
        });
    }

    if(!password || !validatePassword(password)) {
        errors.push({
            field: 'password',
            message: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters.'
        });
    }

    return errors;
}
