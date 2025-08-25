<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = \App\Models\User::all()->map(function ($user) {
            return [
                'id' => $user->id,
                'username' => $user->username,
                'fullName' => $user->fullName,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'status' => $user->status,
                'createdAt' => $user->created_at,
                'lastLogin' => $user->last_login,

                // field tambahan untuk kompatibilitas
                'name' => '', // dikosongkan
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ];
        });

        return inertia('users', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|unique:users,username',
            'fullName' => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'phone'    => 'nullable|string|max:20',
            'role'     => 'required|in:admin,manager,cashier',
            'status'   => 'required|in:active,inactive',
        ]);


        $user = User::create([
            'username' => $validated['username'],
            'fullName' => $validated['fullName'], // pastikan field di DB namanya `full_name` bukan `fullName`
            'email'    => $validated['email'],
            'phone'    => $validated['phone'] ?? null,
            'role'     => $validated['role'],
            'status'   => $validated['status'],
            'password' => Hash::make('password123'), // default password sementara
        ]);

        return redirect()->back()->with('success', 'User created successfully!');
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'username' => 'required|string|unique:users,username,' . $user->id,
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:admin,manager,cashier',
            'status' => 'required|in:active,inactive',
            'password' => 'nullable|string|min:6',
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return redirect()->back()->with('success', 'User updated successfully!');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->back()->with('success', 'User deleted successfully!');
    }
}
