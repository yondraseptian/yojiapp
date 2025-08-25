'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, Maximize, Minimize, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CashierHeader() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);

    const { auth } = usePage<SharedData>().props;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };
    return (
        <header className="border-b px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
                {/* Logo and Name */}
                <div className="flex items-center gap-3">
                    {auth.user?.role === 'admin' && (
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 hover:text-blue-600">
                                <ArrowLeft className="h-4 w-4" />
                                Dashboard
                            </Button>
                        </Link>
                    )}

                    {auth.user?.role === 'cashier' && (
                        <Link href="/transactions">
                            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600">
                                <ArrowLeft className="h-4 w-4" />
                                Transactions history
                            </Button>
                        </Link>
                    )}

                    <div className="mx-2 h-6 w-px" />

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black p-1">
                        <img src="/iconWhite.png" alt="" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Yoji Coffee</h1>
                        <p className="text-sm text-gray-500">ava space</p>
                    </div>
                </div>

                {/* Time and Date */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm font-medium">{formatDate(currentTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-mono text-lg font-bold text-blue-600">{formatTime(currentTime)}</span>
                    </div>
                </div>

                {/* Status dan User Menu */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600"
                        title={isFullscreen ? 'Keluar dari layar penuh' : 'Tampilan layar penuh'}
                    >
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        <span className="text-sm">{isFullscreen ? 'Normal' : 'Fullscreen'}</span>
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                        <User className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                    <p className="text-sm font-medium">{auth.user.fullName}</p>
                                    <p className="text-xs text-gray-500">{auth.user.role}</p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
