import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

// Format date
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    return format(dateObj, formatStr);
  } catch {
    return '-';
  }
};

// Format date with time
export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy hh:mm a');
};

// Format time only
export const formatTime = (time) => {
  if (!time) return '-';
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
};

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return '-';
  }
};

// Format distance
export const formatDistance = (km) => {
  if (km === null || km === undefined) return '-';
  return `${Number(km).toFixed(1)} km`;
};

// Format mileage
export const formatMileage = (km) => {
  if (km === null || km === undefined) return '-';
  return `${Number(km).toLocaleString('en-US', { maximumFractionDigits: 1 })} km`;
};

// Format phone number
export const formatPhone = (phone) => {
  if (!phone) return '-';
  // Format: 077 123 4567
  if (phone.length === 10) {
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
  }
  return phone;
};

// Format currency (if needed in future)
export const formatCurrency = (amount, currency = 'LKR') => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  return `${Number(value).toFixed(decimals)}%`;
};

// Format ride ID
export const formatRideId = (id) => {
  if (!id) return '-';
  return `#${id.toUpperCase()}`;
};

// Format address (truncate if too long)
export const formatAddress = (address, maxLength = 60) => {
  if (!address) return '-';
  if (address.length <= maxLength) return address;
  return address.substring(0, maxLength) + '...';
};

// Get status color class
export const getStatusColorClass = (status) => {
  const colorMap = {
    pending: 'badge-warning',
    awaiting_pm: 'badge-warning',
    awaiting_admin: 'badge-warning',
    pm_approved: 'badge-info',
    approved: 'badge-info',
    assigned: 'badge-purple',
    in_progress: 'badge-info',
    completed: 'badge-success',
    rejected: 'badge-danger',
    cancelled: 'badge-gray',
    available: 'badge-success',
    busy: 'badge-warning',
    maintenance: 'badge-danger',
    offline: 'badge-gray',
  };
  return colorMap[status] || 'badge-gray';
};

// Get status background color
export const getStatusBgColor = (status) => {
  const colorMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    awaiting_pm: 'bg-yellow-100 text-yellow-800',
    awaiting_admin: 'bg-yellow-100 text-yellow-800',
    pm_approved: 'bg-blue-100 text-blue-800',
    approved: 'bg-blue-100 text-blue-800',
    assigned: 'bg-purple-100 text-purple-800',
    in_progress: 'bg-cyan-100 text-cyan-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    available: 'bg-green-100 text-green-800',
    busy: 'bg-yellow-100 text-yellow-800',
    maintenance: 'bg-red-100 text-red-800',
    offline: 'bg-gray-100 text-gray-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

// Get role badge color
export const getRoleBadgeColor = (role) => {
  const colorMap = {
    user: 'bg-blue-100 text-blue-800',
    driver: 'bg-purple-100 text-purple-800',
    admin: 'bg-green-100 text-green-800',
    project_manager: 'bg-amber-100 text-amber-800',
  };
  return colorMap[role] || 'bg-gray-100 text-gray-800';
};