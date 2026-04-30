export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', ...options });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getAvatarUrl = (profilePicture) => {
  if (!profilePicture) return null;
  if (profilePicture.startsWith('http')) return profilePicture;
  return `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${profilePicture}`;
};

export const statusColors = {
  pending: 'warning',
  confirmed: 'primary',
  completed: 'success',
  cancelled: 'danger',
  'no-show': 'gray',
  paid: 'success',
  refunded: 'info',
  active: 'success',
  admitted: 'primary',
  discharged: 'gray',
  'under-treatment': 'warning',
  waiting: 'warning',
  'in-progress': 'primary',
};

export const roleColors = {
  admin: 'danger',
  doctor: 'primary',
  nurse: 'info',
  pharmacist: 'success',
  receptionist: 'warning',
  patient: 'gray',
  worker: 'gray',
};

export const roleLabels = {
  admin: 'Admin',
  doctor: 'Doctor',
  nurse: 'Nurse',
  pharmacist: 'Pharmacist',
  receptionist: 'Receptionist',
  patient: 'Patient',
  worker: 'Worker',
};

export const departments = ['Cardiology','Orthopedics','Neurology','Pediatrics','Dermatology','General Medicine','Gynecology','Oncology','Radiology','Emergency','Psychiatry','ENT','Ophthalmology','Urology','Nephrology'];

export const specializations = departments;

export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const timeSlots = [
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM',
  '04:00 PM','04:30 PM','05:00 PM'
];

export const getTodayString = () => new Date().toISOString().split('T')[0];
