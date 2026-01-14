// Ride Status
export const RIDE_STATUS = {
  PENDING: 'pending',
  AWAITING_PM: 'awaiting_pm',
  AWAITING_ADMIN: 'awaiting_admin',
  PM_APPROVED: 'pm_approved',
  APPROVED: 'approved',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

// Ride Status Labels
export const RIDE_STATUS_LABELS = {
  [RIDE_STATUS.PENDING]: 'Pending',
  [RIDE_STATUS.AWAITING_PM]: 'Awaiting PM Approval',
  [RIDE_STATUS.AWAITING_ADMIN]: 'Awaiting Admin Approval',
  [RIDE_STATUS.PM_APPROVED]: 'PM Approved',
  [RIDE_STATUS.APPROVED]: 'Approved',
  [RIDE_STATUS.ASSIGNED]: 'Assigned',
  [RIDE_STATUS.IN_PROGRESS]: 'In Progress',
  [RIDE_STATUS.COMPLETED]: 'Completed',
  [RIDE_STATUS.REJECTED]: 'Rejected',
  [RIDE_STATUS.CANCELLED]: 'Cancelled',
};

// Ride Status Colors
export const RIDE_STATUS_COLORS = {
  [RIDE_STATUS.PENDING]: 'warning',
  [RIDE_STATUS.AWAITING_PM]: 'warning',
  [RIDE_STATUS.AWAITING_ADMIN]: 'warning',
  [RIDE_STATUS.PM_APPROVED]: 'info',
  [RIDE_STATUS.APPROVED]: 'info',
  [RIDE_STATUS.ASSIGNED]: 'purple',
  [RIDE_STATUS.IN_PROGRESS]: 'info',
  [RIDE_STATUS.COMPLETED]: 'success',
  [RIDE_STATUS.REJECTED]: 'danger',
  [RIDE_STATUS.CANCELLED]: 'gray',
};

// Ride Types
export const RIDE_TYPES = {
  ONE_WAY: 'one_way',
  RETURN: 'return',
};

export const RIDE_TYPE_LABELS = {
  [RIDE_TYPES.ONE_WAY]: 'One-Way',
  [RIDE_TYPES.RETURN]: 'Return Trip',
};

export const VEHICLE_TYPES = {
  VAN: 'van',
  CAB: 'cab',
  LAND_MASTER: 'land_master'
};

// User Roles
export const ROLES = {
  USER: 'user',
  DRIVER: 'driver',
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
};

export const ROLE_LABELS = {
  [ROLES.USER]: 'User',
  [ROLES.DRIVER]: 'Driver',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.PROJECT_MANAGER]: 'Project Manager',
};

export const ROLE_COLORS = {
  [ROLES.USER]: 'blue',
  [ROLES.DRIVER]: 'purple',
  [ROLES.ADMIN]: 'green',
  [ROLES.PROJECT_MANAGER]: 'amber',
};

// Vehicle Status
export const VEHICLE_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  MAINTENANCE: 'maintenance',
};

export const VEHICLE_STATUS_LABELS = {
  [VEHICLE_STATUS.AVAILABLE]: 'Available',
  [VEHICLE_STATUS.BUSY]: 'Busy',
  [VEHICLE_STATUS.MAINTENANCE]: 'Under Maintenance',
};

export const VEHICLE_STATUS_COLORS = {
  [VEHICLE_STATUS.AVAILABLE]: 'success',
  [VEHICLE_STATUS.BUSY]: 'warning',
  [VEHICLE_STATUS.MAINTENANCE]: 'danger',
};

// Driver Status
export const DRIVER_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFFLINE: 'offline',
};

export const DRIVER_STATUS_LABELS = {
  [DRIVER_STATUS.AVAILABLE]: 'Available',
  [DRIVER_STATUS.BUSY]: 'Busy',
  [DRIVER_STATUS.OFFLINE]: 'Offline',
};

export const DRIVER_STATUS_COLORS = {
  [DRIVER_STATUS.AVAILABLE]: 'success',
  [DRIVER_STATUS.BUSY]: 'warning',
  [DRIVER_STATUS.OFFLINE]: 'gray',
};

// Vehicle Types
export const VEHICLE_TYPES = ['Car', 'Van','Cab','Crew Cab'];

// Max values
export const MAX_PENDING_RIDES = 3;
export const MAX_ADVANCE_BOOKING_DAYS = 14;
export const PM_APPROVAL_THRESHOLD_KM = 15;

// Default map center (Colombo, Sri Lanka)
export const DEFAULT_MAP_CENTER = {
  lat: 6.9271,
  lng: 79.8612,
};

export const DEFAULT_MAP_ZOOM = 12;

// Navigation items by role
export const NAV_ITEMS = {
  [ROLES.USER]: [
    { path: '/dashboard', label: 'Dashboard', icon: 'home' },
    { path: '/my-rides', label: 'My Rides', icon: 'car' },
    { path: '/request-ride', label: 'Request Ride', icon: 'plus' },
  ],
  [ROLES.DRIVER]: [
    { path: '/dashboard', label: 'Dashboard', icon: 'home' },
    { path: '/assigned-rides', label: 'Assigned Rides', icon: 'clipboard' },
    { path: '/daily-rides', label: 'My Daily Rides', icon: 'calendar' },
  ],
  [ROLES.ADMIN]: [
    { path: '/dashboard', label: 'Admin Panel', icon: 'dashboard' },
    { path: '/map-view', label: 'Map View', icon: 'map' },
  ],
  [ROLES.PROJECT_MANAGER]: [
    { path: '/dashboard', label: 'Approvals', icon: 'check' },
    { path: '/map-view', label: 'Map View', icon: 'map' },
  ],
};

// Admin tabs
export const ADMIN_TABS = [
  { id: 'rides', label: 'Ride Management' },
  { id: 'tracking', label: 'Live Tracking' },
  { id: 'users', label: 'User Management' },
  { id: 'vehicles', label: 'Vehicle Management' },
  { id: 'mileage', label: 'Vehicle Mileage' },
  { id: 'history', label: 'History' },
];
