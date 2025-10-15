'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  startingBankroll: number | null
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    startingBankroll: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchUserProfile()
    }
  }, [session])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setFormData({
          name: userData.name || '',
          startingBankroll: userData.startingBankroll?.toString() || '',
        })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          startingBankroll: formData.startingBankroll
            ? parseFloat(formData.startingBankroll)
            : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    if (
      !confirm(
        'Are you sure you want to delete your account? This action cannot be undone and will delete all your data.'
      )
    ) {
      setShowDeleteConfirm(false)
      return
    }

    try {
      const response = await fetch('/api/user', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete account')
      }

      alert(
        'Account deleted successfully. You will be redirected to the home page.'
      )
      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-2">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!session || !user) {
    return null
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.image || ''} alt={user.name || ''} />
                    <AvatarFallback className="text-lg">
                      {user.name?.charAt(0) ||
                        user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">
                      {user.name || 'No name set'}
                    </h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <Badge variant="outline" className="mt-1">
                      Member since {formatDate(user.createdAt)}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter your display name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startingBankroll">
                      Starting Bankroll ($)
                    </Label>
                    <Input
                      id="startingBankroll"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.startingBankroll}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          startingBankroll: e.target.value,
                        }))
                      }
                      placeholder="Enter your starting bankroll"
                    />
                    <p className="text-muted-foreground text-sm">
                      This is used to calculate your net profit/loss from your
                      starting point.
                    </p>
                  </div>
                </div>

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
              <CardDescription>
                Overview of your betting activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">-</div>
                  <div className="text-muted-foreground text-sm">
                    Total Picks
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">-</div>
                  <div className="text-muted-foreground text-sm">
                    Total Parlays
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">-</div>
                  <div className="text-muted-foreground text-sm">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">-</div>
                  <div className="text-muted-foreground text-sm">
                    Net Profit
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings & Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <a href="/picks">View All Picks</a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <a href="/parlays">View All Parlays</a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <a href="/bankroll">Manage Bankroll</a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <a href="/analytics">View Analytics</a>
              </Button>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="mb-2 font-medium">Authentication</h4>
                <p className="text-muted-foreground mb-3 text-sm">
                  You&apos;re signed in with {session.user?.email}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/api/auth/signout')}
                >
                  Sign Out
                </Button>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 font-medium">Data Export</h4>
                <p className="text-muted-foreground mb-3 text-sm">
                  Download all your betting data
                </p>
                <Button variant="outline" size="sm" disabled>
                  Export Data (Coming Soon)
                </Button>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 font-medium text-red-600">Danger Zone</h4>
                <p className="text-muted-foreground mb-3 text-sm">
                  Permanently delete your account and all data
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAccount}
                >
                  {showDeleteConfirm ? 'Confirm Delete' : 'Delete Account'}
                </Button>
                {showDeleteConfirm && (
                  <p className="mt-2 text-xs text-red-600">
                    This action cannot be undone!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
