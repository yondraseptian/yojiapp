import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/data';
import type { Permission, User } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Calendar, Clock, Crown, Edit, Filter, Mail, Phone, Plus, Search, Shield, Trash2, UserCheck, UserIcon, Users2, UserX } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

export default function Users() {
    const { users } = usePage().props as unknown as { users: User[] };
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const { data, setData, post, put, reset, errors } = useForm({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        role: '' as 'admin' | 'manager' | 'cashier' | '',
        status: 'active' as 'active' | 'inactive',
    });

    // Filter users
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'all' || user.role === selectedRole;
        const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

   

    // Reset form
    const resetForm = () => {
        setData({
            username: '',
            fullName: '',
            email: '',
            phone: '',
            role: '',
            status: 'active',
        });
    };

    // Add new user
    const handleAddUser = () => {
        if (!data.username || !data.fullName || !data.email || !data.role) {
            return;
        }

        post(route('users.store'), {
            onSuccess: () => {
                setShowAddDialog(false);
                resetForm();
            },
        });
        console.log(data);
    };

    // Edit user
    const handleEditUser = () => {
        if (!selectedUser || !data.username || !data.fullName || !data.email || !data.role) {
            return;
        }

        put(route('users.update', selectedUser.id), {
            onSuccess: () => {
                setShowEditDialog(false);
                setSelectedUser(null);
                reset();
            },
        });
    };

    // Delete user
    const handleDeleteUser = () => {
        if (!selectedUser) return;

        router.delete(route('users.destroy', { id: selectedUser.id }), {
                    onSuccess: () => {
                        console.log(`User ${selectedUser.name} berhasil dihapus`);
                    },
                    onError: (errors) => {
                        console.error(errors);
                    },
                });
                setShowDeleteDialog(false);
                setSelectedUser(null);
    };

    // Open edit dialog
    const openEditDialog = (user: User) => {
        setSelectedUser(user);
        setData({
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            status: user.status,
        });
        setShowEditDialog(true);
    };

    // Open delete dialog
    const openDeleteDialog = (user: User) => {
        setSelectedUser(user);
        setShowDeleteDialog(true);
    };

    // Toggle user status
    const toggleUserStatus = (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active";

    router.put(
        route("users.update", user.id), // pastikan route sesuai di web.php
        { status: newStatus },
        {
            preserveScroll: true,
            onSuccess: () => {
                // update state lokal juga supaya langsung kelihatan
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === user.id ? { ...u, status: newStatus } : u
                    )
                );
            },
        }
    );
};

    // Get role icon
    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin':
                return <Crown className="h-4 w-4" />;
            case 'manager':
                return <Shield className="h-4 w-4" />;
            case 'cashier':
                return <UserIcon className="h-4 w-4" />;
            default:
                return <UserIcon className="h-4 w-4" />;
        }
    };

    // Get role color
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'manager':
                return 'bg-blue-100 text-blue-800';
            case 'cashier':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 ';
        }
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="min-h-screen  p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold ">User Management</h1>
                            <p className="mt-1 text-gray-600">Manage staff accounts and permissions</p>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setShowAddDialog(true)} >
                                <Plus className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Card className=" shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                                <Users2 className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold ">{users.length}</div>
                            </CardContent>
                        </Card>

                        <Card className=" shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
                                <UserCheck className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold ">{users.filter((u) => u.status === 'active').length}</div>
                            </CardContent>
                        </Card>

                        <Card className=" shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
                                <Crown className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold ">{users.filter((u) => u.role === 'admin').length}</div>
                            </CardContent>
                        </Card>

                        <Card className=" shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">Cashiers</CardTitle>
                                <UserIcon className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold ">{users.filter((u) => u.role === 'cashier').length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className=" shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-4 md:flex-row">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-gray-400" />
                                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Filter by role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="cashier">Cashier</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredUsers.map((user) => (
                            <Card key={user.id} className=" shadow-sm transition-shadow hover:shadow-md">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full ">
                                                {getRoleIcon(user.role)}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{user.fullName}</CardTitle>
                                                <p className="text-sm text-gray-500">@{user.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                                {user.status === 'active' ? (
                                                    <UserCheck className="mr-1 h-3 w-3" />
                                                ) : (
                                                    <UserX className="mr-1 h-3 w-3" />
                                                )}
                                                {user.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <span>{user.email}</span>
                                        </div>
                                        {user.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span>{user.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>Joined {formatDate(user.createdAt.toString())}</span>
                                        </div>
                                        {user.lastLogin && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span>Last login {formatDate(user.lastLogin.toString())}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" size="sm" onClick={() => openEditDialog(user)} className="flex-1">
                                            <Edit className="mr-1 h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleUserStatus(user)}
                                            className={`flex-1 ${
                                                user.status === 'active'
                                                    ? 'text-orange-600 hover:bg-orange-50 hover:text-orange-700'
                                                    : 'text-green-600 hover:bg-green-50 hover:text-green-700'
                                            }`}
                                        >
                                            {user.status === 'active' ? (
                                                <>
                                                    <UserX className="mr-1 h-4 w-4" />
                                                    Deactivate
                                                </>
                                            ) : (
                                                <>
                                                    <UserCheck className="mr-1 h-4 w-4" />
                                                    Activate
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openDeleteDialog(user)}
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredUsers.length === 0 && (
                        <Card className=" shadow-sm">
                            <CardContent className="py-12 text-center">
                                <Users2 className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium text-gray-600">No users found</h3>
                                <p className="mb-4 text-gray-500">Try adjusting your search or filter criteria</p>
                                <Button onClick={() => setShowAddDialog(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First User
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Add User Dialog */}
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add New User</DialogTitle>
                            <DialogDescription>Create a new staff account with appropriate permissions</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={data.username}
                                        onChange={(e) => setData({ ...data, username: e.target.value })}
                                        placeholder="e.g., john_doe"
                                    />
                                    <span className="text-xs text-red-500">{errors.username}</span>
                                </div>
                                <div>
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={data.fullName}
                                        onChange={(e) => setData({ ...data, fullName: e.target.value })}
                                        placeholder="e.g., John Doe"
                                    />
                                    <span className="text-xs text-red-500">{errors.fullName}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
                                        placeholder="e.g., john@coffeeshop.com"
                                    />
                                    <span className="text-xs text-red-500">{errors.email}</span>
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone (Optional)</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData({ ...data, phone: e.target.value })}
                                        placeholder="e.g., +62812345678"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={data.role}
                                        onValueChange={(value: 'admin' | 'manager' | 'cashier') => {
                                            setData({
                                                ...data,
                                                role: value,
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="cashier">Cashier</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(value: 'active' | 'inactive') => setData({ ...data, status: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddUser}>Add User</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit User Dialog */}
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                    <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>Update user information and permissions</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editUsername">Username</Label>
                                    <Input id="editUsername" value={data.username} onChange={(e) => setData({ ...data, username: e.target.value })} />
                                </div>
                                <div>
                                    <Label htmlFor="editFullName">Full Name</Label>
                                    <Input id="editFullName" value={data.fullName} onChange={(e) => setData({ ...data, fullName: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editEmail">Email</Label>
                                    <Input
                                        id="editEmail"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="editPhone">Phone</Label>
                                    <Input id="editPhone" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editRole">Role</Label>
                                    <Select
                                        value={data.role}
                                        onValueChange={(value: 'admin' | 'manager' | 'cashier') => {
                                            setData({
                                                ...data,
                                                role: value,
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="cashier">Cashier</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="editStatus">Status</Label>
                                    <Select value={data.status} onValueChange={(value: 'active' | 'inactive') => setData({ ...data, status: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleEditUser}>Update User</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{selectedUser?.fullName}"? This action cannot be undone and will remove all access
                                for this user.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
                                Delete User
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setUsers(updatedUsers: { status: string; id: number; name: string; email: string; avatar?: string; email_verified_at: string | null; created_at: string; updated_at: string; username: string; fullName: string; phone?: string; role: "admin" | "manager" | "cashier"; permissions: Permission[]; createdAt: Date; lastLogin?: Date; }[]) {
    throw new Error('Function not implemented.');
}

