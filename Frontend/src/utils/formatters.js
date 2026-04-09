// Format currency in INR
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Format date
export const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date));
};

// Format date with time
export const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
};

// Format number
export const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN').format(number);
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now - then;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
};

// Calculate discount percentage
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
    if (!originalPrice || !discountedPrice) return 0;
    const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
    return Math.round(discount);
};
