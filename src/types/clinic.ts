export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  crm: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: Date;
  phone: string;
  email: string;
  address: string;
  healthInsurance?: string;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  status: 'active' | 'inactive';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  serviceId: string;
  serviceName: string;
  date: Date;
  time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  price: number;
}

export interface Transaction {
  id: string;
  type: 'receivable' | 'payable';
  description: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  category: string;
  reference?: string;
}

export interface CashMovement {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: Date;
  category: string;
  paymentMethod: 'cash' | 'credit' | 'debit' | 'pix' | 'transfer';
}

export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  agency: string;
  account: string;
  balance: number;
}

export interface BankMovement {
  id: string;
  accountId: string;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  date: Date;
  category: string;
}

export type UserRole = 'admin' | 'manager' | 'receptionist' | 'doctor' | 'financial';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  permissions: string[];
}
