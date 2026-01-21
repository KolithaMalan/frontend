import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiRefreshCw,
  FiFilter,
} from 'react-icons/fi';
import { usersAPI } from '../../../services/api';
import Loader from '../../common/Loader';
import EmptyState from '../../common/EmptyState';
import StatusBadge from '../../common/StatusBadge';
import UserForm from '../UserFormModal';
import ConfirmDialog from '../../common/ConfirmDialog';
import { ROLE_LABELS, DRIVER_STATUS_LABELS } from '../../../utils/constants';
import { getRoleBadgeColor, getStatusBgColor } from '../../../utils/formatters';
import { formatDate, formatPhone } from '../../../utils/formatters';
import { getInitials } from '../../../utils/helpers';
import toast from 'react-hot-toast';

const UserManagementTab = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = useCallback(async (showLoader = true, page = 1) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const params = {
        page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        role: roleFilter || undefined,
      };

      const response = await usersAPI.getAll(params);
      setUsers(response.data.users);
      setPagination({
        page: response.data.currentPage,
        limit: pagination.limit,
        total: response.data.total,
        totalPages: response.data.totalPages,
      });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, roleFilter, pagination.limit]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers(true, 1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, roleFilter]);

  const handleRefresh = () => {
    fetchUsers(false, pagination.page);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    setDeleteLoading(true);
    try {
      await usersAPI.delete(selectedUser._id);
      toast.success('User deleted successfully');
      setShowDeleteDialog(false);
      setSelectedUser(null);
      fetchUsers(false, pagination.page);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user';
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSuccess = () => {
    fetchUsers(false, pagination.page);
  };

  const getRoleGradient = (role) => {
    const gradients = {
      user: 'from-blue-500 to-blue-600',
      driver: 'from-purple-500 to-purple-600',
      admin: 'from-green-500 to-green-600',
      project_manager: 'from-amber-500 to-amber-600',
    };
    return gradients[role] || gradients.user;
  };

  if (loading) {
    return <Loader text="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      {/* Header & Actions - BEAUTIFUL UI */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="input pl-10 pr-4"
            />
          </div>

          {/* Role Filter - BEAUTIFUL */}
          <div className="relative min-w-[200px]">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input pl-10 pr-10 appearance-none bg-white cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="user">👤 Users</option>
              <option value="driver">🚗 Drivers</option>
              <option value="admin">👑 Admins</option>
              <option value="project_manager">📊 Plant Manager</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons - BEAUTIFUL */}
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline"
          >
            <FiRefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleCreateUser}
            className="btn btn-primary"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Create User
          </button>
        </div>
      </div>

      {/* Users List */}
      {users.length > 0 ? (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {users.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="table-row-hover"
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleGradient(user.role)} flex items-center justify-center text-white font-semibold text-sm`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-gray-900">{formatPhone(user.phone)}</p>
                    </td>
                    <td>
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={user.status} type="driver" />
                    </td>
                    <td>
                      <p className="text-sm text-gray-500">{formatDate(user.createdAt)}</p>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        {!user.isHardcoded && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchUsers(false, pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="btn btn-outline btn-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchUsers(false, pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="btn btn-outline btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={FiUser}
            title="No users found"
            description={searchQuery || roleFilter ? 'Try adjusting your filters' : 'Create your first user to get started'}
            actionLabel={!searchQuery && !roleFilter ? 'Create User' : undefined}
            onAction={handleCreateUser}
          />
        </div>
      )}

      {/* User Form Modal */}
      <UserForm
        user={selectedUser}
        isOpen={showUserForm}
        onClose={() => {
          setShowUserForm(false);
          setSelectedUser(null);
        }}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default UserManagementTab;