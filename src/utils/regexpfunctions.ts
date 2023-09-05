function isValidEmail(email:string) {
    // Regex for email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return emailRegex.test(email);
}

export {isValidEmail};