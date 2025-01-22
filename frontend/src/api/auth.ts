export async function login(formData: { email: string; password: string }) {
    const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function register(data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
}) {
    const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
}
