import React, { useState, useEffect } from 'react';
import { Plus, Search, Tag, ArrowUpDown, Copy, Edit, QrCode, Trash, ExternalLink, BarChart3, Calendar, Globe, TrendingUp, Filter, Download, Share2, Eye, EyeOff, Star, Archive, AlertTriangle, Zap, Smartphone, Bot, Bell, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import QRCode from 'qrcode';

interface Link {
  id: string;
  originalUrl: string;
  shortSlug: string;
  clickCount: number;
  createdDate: string;
  lastClicked?: string;
  tags?: string[];
  isActive: boolean;
  expiryDate?: string;
  isFavorite?: boolean;
  description?: string;
  clickHistory?: { date: string; count: number; timestamp?: string; }[];
  qrCode?: string;
  isExpired?: boolean;
  emailAlertsEnabled?: boolean;
  aiGenerated?: boolean;
}

const Index = () => {
  const [links, setLinks] = useState<Link[]>([
    {
      id: '1',
      originalUrl: 'https://example.com/very-long-url-that-needs-shortening',
      shortSlug: 'abc123',
      clickCount: 142,
      createdDate: '2024-06-15',
      lastClicked: '2024-06-16',
      tags: ['work', 'important'],
      isActive: true,
      isFavorite: true,
      description: 'Main landing page',
      emailAlertsEnabled: true,
      clickHistory: [
        { date: '2024-06-10', count: 5, timestamp: '2024-06-10T09:00:00Z' },
        { date: '2024-06-11', count: 12, timestamp: '2024-06-11T14:30:00Z' },
        { date: '2024-06-12', count: 8, timestamp: '2024-06-12T11:15:00Z' },
        { date: '2024-06-13', count: 18, timestamp: '2024-06-13T16:45:00Z' },
        { date: '2024-06-14', count: 25, timestamp: '2024-06-14T13:20:00Z' },
        { date: '2024-06-15', count: 35, timestamp: '2024-06-15T10:30:00Z' },
        { date: '2024-06-16', count: 39, timestamp: '2024-06-16T15:45:00Z' }
      ]
    },
    {
      id: '2',
      originalUrl: 'https://github.com/user/repository',
      shortSlug: 'gh-repo',
      clickCount: 228,
      createdDate: '2024-06-14',
      lastClicked: '2024-06-17',
      tags: ['development', 'github'],
      isActive: true,
      isFavorite: false,
      description: 'GitHub repository',
      aiGenerated: true,
      clickHistory: [
        { date: '2024-06-14', count: 45 },
        { date: '2024-06-15', count: 68 },
        { date: '2024-06-16', count: 55 },
        { date: '2024-06-17', count: 60 }
      ]
    },
    {
      id: '3',
      originalUrl: 'https://docs.example.com/api-documentation',
      shortSlug: 'api-docs',
      clickCount: 76,
      createdDate: '2024-06-13',
      tags: ['documentation', 'api'],
      isActive: false,
      isFavorite: false,
      description: 'API Documentation',
      expiryDate: '2024-12-31',
      isExpired: false
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isAuthenticated] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // New state for enhanced features
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRLink, setSelectedQRLink] = useState<Link | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showExpiredWarning, setShowExpiredWarning] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState('');
  const [emailThreshold, setEmailThreshold] = useState(100);
  const [mobileView, setMobileView] = useState(false);
  const [showBotDialog, setShowBotDialog] = useState(false);
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);
  const [botConnected, setBotConnected] = useState(false);
  const [discordConnected, setDiscordConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  
  interface Notification {
    id: number;
    text: string;
    time: string;
    read: boolean;
  }
  
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, text: 'Your link was clicked 5 times today', time: '2 hours ago', read: false },
    { id: 2, text: 'New feature: AI Link Suggestions', time: '1 day ago', read: false },
    { id: 3, text: 'Your link is expiring soon', time: '3 days ago', read: true },
  ]);
  
  const { toast } = useToast();
  
  const handleBotConnect = (type: 'slack' | 'discord') => {
    setConnecting(true);
    
    // Simulate API call
    setTimeout(() => {
      if (type === 'slack') {
        setBotConnected(true);
        toast({
          title: "Slack Connected!",
          description: "Your Slack bot has been successfully connected.",
        });
      } else {
        setDiscordConnected(true);
        toast({
          title: "Discord Connected!",
          description: "Your Discord bot has been successfully connected.",
        });
      }
      setConnecting(false);
      setShowBotDialog(false);
    }, 1500);
  };
  
  const handleDisconnect = (type: 'slack' | 'discord') => {
    setConnecting(true);
    
    // Simulate API call
    setTimeout(() => {
      if (type === 'slack') {
        setBotConnected(false);
        toast({
          title: "Slack Disconnected",
          description: "Your Slack bot has been disconnected.",
        });
      } else {
        setDiscordConnected(false);
        toast({
          title: "Discord Disconnected",
          description: "Your Discord bot has been disconnected.",
        });
      }
      setConnecting(false);
    }, 1000);
  };
  
  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    if (unreadCount > 0) {
      setUnreadCount(prev => prev - 1);
    }
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  useEffect(() => {
    setIsLoaded(true);
    checkExpiredLinks();
    detectMobile();
    window.addEventListener('resize', detectMobile);
    return () => window.removeEventListener('resize', detectMobile);
  }, []);

  const detectMobile = () => {
    setMobileView(window.innerWidth < 768);
  };

  const checkExpiredLinks = () => {
    const expired = links.filter(link => 
      link.expiryDate && new Date(link.expiryDate) < new Date()
    );
    if (expired.length > 0) {
      setShowExpiredWarning(true);
    }
  };

  // Generate AI slug suggestions
  const generateAISuggestions = (url: string) => {
    const keywords = url.split('/').pop()?.split('.')[0] || '';
    const suggestions = [
      keywords.substring(0, 6),
      `${keywords.substring(0, 4)}-${Date.now().toString().slice(-3)}`,
      `ai-${keywords.substring(0, 5)}`,
      `smart-${keywords.substring(0, 4)}`,
      `auto-${Math.random().toString(36).substring(2, 7)}`
    ];
    setAiSuggestions(suggestions);
  };

  // Generate QR Code
  const generateQRCode = async (link: Link) => {
    try {
      const qrCodeData = await QRCode.toDataURL(`https://siggly.co/${link.shortSlug}`, {
        width: 256,
        margin: 2,
        color: {
          dark: '#7C3AED',
          light: '#FFFFFF'
        }
      });
      
      setLinks(links.map(l => 
        l.id === link.id ? { ...l, qrCode: qrCodeData } : l
      ));
      
      setSelectedQRLink({ ...link, qrCode: qrCodeData });
      setShowQRModal(true);
      
      toast({
        title: "QR Code Generated!",
        description: "QR code is ready for download or sharing.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Download QR Code
  const downloadQRCode = () => {
    if (selectedQRLink?.qrCode) {
      const link = document.createElement('a');
      link.download = `${selectedQRLink.shortSlug}-qr.png`;
      link.href = selectedQRLink.qrCode;
      link.click();
    }
  };

  // Send to Slack/Discord
  const sendToSlack = async (link: Link) => {
    if (!slackWebhook) {
      toast({
        title: "Slack webhook required",
        description: "Please configure your Slack webhook in settings.",
        variant: "destructive"
      });
      return;
    }

    try {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🔗 New short link created: https://siggly.co/${link.shortSlug}\nOriginal: ${link.originalUrl}\nDescription: ${link.description || 'No description'}`
        })
      });
      
      toast({
        title: "Sent to Slack!",
        description: "Link notification sent to your Slack channel.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send to Slack. Check your webhook URL.",
        variant: "destructive"
      });
    }
  };

  // Check for high usage alerts
  const checkHighUsageAlert = (link: Link) => {
    if (link.emailAlertsEnabled && link.clickCount >= emailThreshold) {
      toast({
        title: "🚨 High Usage Alert",
        description: `Link "${link.shortSlug}" has reached ${link.clickCount} clicks!`,
        variant: "destructive"
      });
    }
  };

  const handleCopyLink = (slug: string) => {
    navigator.clipboard.writeText(`https://siggly.co/${slug}`);
    toast({
      title: "Link copied!",
      description: "The short link has been copied to your clipboard.",
    });
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
    toast({
      title: "Link deleted",
      description: "The link has been removed successfully.",
    });
  };

  const handleToggleActive = (id: string) => {
    setLinks(links.map(link => 
      link.id === id ? { ...link, isActive: !link.isActive } : link
    ));
    toast({
      title: "Link status updated",
      description: "The link status has been changed.",
    });
  };

  const handleToggleFavorite = (id: string) => {
    setLinks(links.map(link => 
      link.id === id ? { ...link, isFavorite: !link.isFavorite } : link
    ));
  };

  const handleBulkDelete = () => {
    setLinks(links.filter(link => !selectedLinks.includes(link.id)));
    setSelectedLinks([]);
    toast({
      title: "Links deleted",
      description: `${selectedLinks.length} links have been removed.`,
    });
  };

  const handleBulkToggleActive = () => {
    setLinks(links.map(link => 
      selectedLinks.includes(link.id) ? { ...link, isActive: !link.isActive } : link
    ));
    setSelectedLinks([]);
    toast({
      title: "Links updated",
      description: `${selectedLinks.length} links have been updated.`,
    });
  };

  const handleCreateLink = () => {
    if (!newUrl) return;
    
    const newLink: Link = {
      id: Date.now().toString(),
      originalUrl: newUrl,
      shortSlug: customSlug || Math.random().toString(36).substring(7),
      clickCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      tags: newTags ? newTags.split(',').map(tag => tag.trim()) : [],
      isActive: true,
      isFavorite: false,
      description: newDescription,
      expiryDate: expiryDate || undefined,
      clickHistory: [],
      emailAlertsEnabled: false,
      aiGenerated: aiSuggestions.includes(customSlug)
    };
    
    setLinks([newLink, ...links]);
    resetModal();
    
    toast({
      title: "Link created!",
      description: "Your new short link is ready to use.",
    });
  };

  const resetModal = () => {
    setNewUrl('');
    setCustomSlug('');
    setNewDescription('');
    setNewTags('');
    setExpiryDate('');
    setIsModalOpen(false);
    setEditingLink(null);
    setAiSuggestions([]);
  };

  // Get all unique tags
  const allTags = Array.from(new Set(links.flatMap(link => link.tags || [])));

  // Calculate enhanced statistics
  const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
  const activeLinks = links.filter(link => link.isActive).length;
  const totalLinks = links.length;
  const averageClicks = totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0;
  const expiredLinks = links.filter(link => link.isExpired).length;
  const favoriteLinks = links.filter(link => link.isFavorite).length;
  const aiGeneratedLinks = links.filter(link => link.aiGenerated).length;

  // Prepare chart data
  const chartData = links[0]?.clickHistory?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    clicks: item.count,
    name: item.date
  })) || [];

  // Enhanced filtering and sorting
  const filteredLinks = links
    .filter(link => {
      const matchesSearch = 
        link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.shortSlug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (link.description && link.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => link.tags?.includes(tag));
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && link.isActive) ||
        (filterStatus === 'inactive' && !link.isActive);
      
      return matchesSearch && matchesTags && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof Link] || '';
      const bValue = b[sortBy as keyof Link] || '';
      const comparison = aValue > bValue ? 1 : -1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const StatCard = ({ title, value, icon: Icon, trend, color }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    trend?: string; 
    color?: string;
  }) => (
    <Card className={`hover:shadow-lg transition-all duration-300 border-purple-100 bg-white/80 backdrop-blur-sm ${color ? `border-l-4 border-l-${color}-500` : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-purple-900">{value}</p>
            {trend && (
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                {trend}
              </p>
            )}
          </div>
          <Icon className="w-8 h-8 text-purple-500" />
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-fade-in">
      <div className="w-32 h-32 mb-6 rounded-full bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
        <ExternalLink className="w-12 h-12 text-purple-500" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-2">No links yet!</h3>
      <p className="text-gray-600 mb-6">Create your first one ✨</p>
      <Button 
        onClick={() => setIsModalOpen(true)}
        className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Your First Link
      </Button>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Expired Links Warning */}
      {showExpiredWarning && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                You have {expiredLinks} expired link(s). Consider reviewing or extending their expiry dates.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExpiredWarning(false)}
              className="ml-auto"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Siggly ⚡
              </h1>
              {mobileView && (
                <Badge variant="outline" className="text-xs">
                  <Smartphone className="w-3 h-3 mr-1" />
                  Mobile
                </Badge>
              )}
            </div>
            
            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                {/* Bot Button */}
                <Dialog open={showBotDialog} onOpenChange={setShowBotDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bot className="w-4 h-4 mr-2" />
                      Bots
                      {(botConnected || discordConnected) && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Connect Bots</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-4">
                        {/* Slack Integration */}
                        <div className={`p-4 rounded-lg border ${botConnected ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${botConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <img 
                                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg" 
                                  className="w-6 h-6" 
                                  alt="Slack"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium">Slack</h4>
                                <p className="text-xs text-gray-500">Get notifications in Slack</p>
                              </div>
                            </div>
                            {botConnected ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDisconnect('slack')}
                                disabled={connecting}
                              >
                                {connecting ? 'Disconnecting...' : 'Disconnect'}
                              </Button>
                            ) : (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleBotConnect('slack')}
                                disabled={connecting}
                              >
                                {connecting ? 'Connecting...' : 'Connect'}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Discord Integration */}
                        <div className={`p-4 rounded-lg border ${discordConnected ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${discordConnected ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                                <img 
                                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/discord/discord-original.svg" 
                                  className="w-6 h-6" 
                                  alt="Discord"
                                />
                              </div>
                              <div>
                                <h4 className="font-medium">Discord</h4>
                                <p className="text-xs text-gray-500">Get notifications in Discord</p>
                              </div>
                            </div>
                            {discordConnected ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDisconnect('discord')}
                                disabled={connecting}
                              >
                                {connecting ? 'Disconnecting...' : 'Disconnect'}
                              </Button>
                            ) : (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleBotConnect('discord')}
                                disabled={connecting}
                              >
                                {connecting ? 'Connecting...' : 'Connect'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-xs text-gray-500 text-center">
                          Connect to get real-time notifications about your links
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Alerts Button */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative"
                    onClick={() => setShowAlertsDialog(!showAlertsDialog)}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Alerts
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                  
                  {showAlertsDialog && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-medium">Notifications</h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={markAllAsRead}
                        >
                          Mark all as read
                        </Button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div 
                              key={notification.id}
                              className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <p className="text-sm">{notification.text}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          ))
                        ) : (
                          <p className="p-4 text-sm text-gray-500 text-center">No new notifications</p>
                        )}
                      </div>
                      <div className="p-2 border-t border-gray-200 text-center">
                        <Button variant="ghost" size="sm" className="text-xs">
                          View all notifications
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile */}
                <div className="flex items-center space-x-2 ml-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-violet-400"></div>
                  <span className="text-sm font-medium text-gray-700">John Doe</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Enhanced Statistics Cards */}
            <div className={`grid grid-cols-1 ${mobileView ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6 animate-fade-in`}>
              <StatCard title="Total Links" value={totalLinks} icon={ExternalLink} color="blue" />
              <StatCard title="Active Links" value={activeLinks} icon={Globe} color="green" />
              <StatCard title="Total Clicks" value={totalClicks.toLocaleString()} icon={BarChart3} trend="+23%" color="purple" />
              <StatCard title="Avg. Clicks" value={averageClicks} icon={TrendingUp} color="orange" />
              {!mobileView && (
                <>
                  <StatCard title="Favorites" value={favoriteLinks} icon={Star} color="yellow" />
                  <StatCard title="AI Generated" value={aiGeneratedLinks} icon={Zap} color="violet" />
                  <StatCard title="Expired" value={expiredLinks} icon={AlertTriangle} color="red" />
                  <StatCard title="With Alerts" value={links.filter(l => l.emailAlertsEnabled).length} icon={Mail} color="indigo" />
                </>
              )}
            </div>

            {/* Search and Filters */}
            <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className={`flex ${mobileView ? 'flex-col' : 'flex-col lg:flex-row'} gap-4 items-center justify-between mb-4`}>
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search links, descriptions, or URLs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'inactive') => setFilterStatus(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Links</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdDate">Created Date</SelectItem>
                      <SelectItem value="clickCount">Click Count</SelectItem>
                      <SelectItem value="shortSlug">Short URL</SelectItem>
                      <SelectItem value="lastClicked">Last Clicked</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="border-purple-200 hover:bg-purple-50"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tag Filter */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600 font-medium">Filter by tags:</span>
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedTags.includes(tag) 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'border-purple-200 hover:bg-purple-50'
                      }`}
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag) 
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {selectedTags.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTags([])}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Bulk Actions */}
            {selectedLinks.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 animate-scale-in">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-900">
                    {selectedLinks.length} link{selectedLinks.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleBulkToggleActive}>
                      Toggle Status
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleBulkDelete} className="text-red-600 border-red-200 hover:bg-red-50">
                      Delete Selected
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedLinks([])}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Links Grid */}
            {filteredLinks.length === 0 && searchTerm === '' && selectedTags.length === 0 ? (
              <EmptyState />
            ) : filteredLinks.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No matching links</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 ${mobileView ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'} animate-fade-in`} style={{ animationDelay: '0.4s' }}>
                {filteredLinks.map((link, index) => (
                  <Card 
                    key={link.id} 
                    className={`group hover:scale-105 transition-all duration-300 hover:shadow-xl border-purple-100 hover:border-purple-300 bg-white/80 backdrop-blur-sm ${
                      !link.isActive ? 'opacity-75' : ''
                    } ${link.isExpired ? 'border-l-4 border-l-red-500' : ''}`}
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <Checkbox
                            checked={selectedLinks.includes(link.id)}
                            onCheckedChange={(checked) => {
                              setSelectedLinks(prev => 
                                checked 
                                  ? [...prev, link.id]
                                  : prev.filter(id => id !== link.id)
                              );
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                siggly.co/{link.shortSlug}
                              </h3>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleFavorite(link.id)}
                                className="p-1 h-auto"
                              >
                                <Star className={`w-4 h-4 ${link.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                              </Button>
                              {link.aiGenerated && (
                                <Badge variant="outline" className="text-xs bg-violet-100 text-violet-700">
                                  <Zap className="w-3 h-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                            </div>
                            {link.description && (
                              <p className="text-sm text-gray-600 mb-1">{link.description}</p>
                            )}
                            <p className="text-sm text-gray-600 truncate" title={link.originalUrl}>
                              {link.originalUrl}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            {link.clickCount} clicks
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(link.createdDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {link.emailAlertsEnabled && (
                            <Bell className="w-4 h-4 text-blue-500" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(link.id)}
                            className="p-1 h-auto"
                          >
                            {link.isActive ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {link.tags && link.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {link.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {link.expiryDate && (
                        <div className={`text-xs mb-4 flex items-center ${link.isExpired ? 'text-red-600' : 'text-amber-600'}`}>
                          <Calendar className="w-3 h-3 mr-1" />
                          {link.isExpired ? 'Expired' : 'Expires'}: {new Date(link.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                      
                      <div className={`flex ${mobileView ? 'flex-col gap-2' : 'space-x-2'}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyLink(link.shortSlug)}
                          className="flex-1 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingLink(link);
                            setNewUrl(link.originalUrl);
                            setCustomSlug(link.shortSlug);
                            setNewDescription(link.description || '');
                            setNewTags(link.tags?.join(', ') || '');
                            setExpiryDate(link.expiryDate || '');
                            setIsModalOpen(true);
                          }}
                          className="border-purple-200 hover:bg-purple-50"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateQRCode(link)}
                          className="border-purple-200 hover:bg-purple-50"
                        >
                          <QrCode className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => sendToSlack(link)}
                          className="border-blue-200 hover:bg-blue-50"
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteLink(link.id)}
                          className="border-red-200 hover:bg-red-50 text-red-600"
                        >
                          <Trash className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Click History Chart */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Click Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      clicks: {
                        label: "Clicks",
                        color: "#8B5CF6",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="clicks"
                          stroke="#8B5CF6"
                          fill="#8B5CF6"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Top Performing Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {links
                      .sort((a, b) => b.clickCount - a.clickCount)
                      .slice(0, 5)
                      .map((link, index) => (
                      <div key={link.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{link.shortSlug}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{link.description || link.originalUrl}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{link.clickCount} clicks</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {links
                      .filter(link => link.lastClicked)
                      .sort((a, b) => new Date(b.lastClicked!).getTime() - new Date(a.lastClicked!).getTime())
                      .slice(0, 5)
                      .map(link => (
                      <div key={link.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{link.shortSlug}</p>
                          <p className="text-xs text-gray-500">
                            Last clicked: {link.lastClicked ? new Date(link.lastClicked).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailThreshold">Email Alert Threshold</Label>
                    <Input
                      id="emailThreshold"
                      type="number"
                      value={emailThreshold}
                      onChange={(e) => setEmailThreshold(Number(e.target.value))}
                      placeholder="100"
                    />
                    <p className="text-xs text-gray-500">Send email when links reach this many clicks</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                    <Input
                      id="slackWebhook"
                      type="url"
                      value={slackWebhook}
                      onChange={(e) => setSlackWebhook(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                    />
                    <p className="text-xs text-gray-500">For sending new link notifications to Slack</p>
                  </div>
                </CardContent>
              </Card>

              {/* Export & Backup */}
              <Card>
                <CardHeader>
                  <CardTitle>Export & Backup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const dataStr = JSON.stringify(links, null, 2);
                      const dataBlob = new Blob([dataStr], {type: 'application/json'});
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'siggly-links-backup.json';
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All Links
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Generate API Key
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Bot className="w-4 h-4 mr-2" />
                    Slack/Discord Bot Setup
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code for {selectedQRLink?.shortSlug}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {selectedQRLink?.qrCode && (
              <img 
                src={selectedQRLink.qrCode} 
                alt={`QR Code for ${selectedQRLink.shortSlug}`}
                className="w-64 h-64 border border-gray-200 rounded-lg"
              />
            )}
            <div className="flex gap-2">
              <Button onClick={downloadQRCode} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => selectedQRLink && handleCopyLink(selectedQRLink.shortSlug)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <div className="fixed right-6 z-50" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}>
          <DialogTrigger asChild>
            <Button 
              className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
              size="lg"
              aria-label="Create New Link"
            >
              <Plus className="w-8 h-8" />
            </Button>
          </DialogTrigger>
        </div>
        
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-lg border-purple-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              {editingLink ? 'Edit Link' : 'Create New Link'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url">Original URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value);
                  if (e.target.value && !editingLink) {
                    generateAISuggestions(e.target.value);
                  }
                }}
                className="border-purple-200 focus:border-purple-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                placeholder="Brief description of the link"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="border-purple-200 focus:border-purple-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Custom Slug (optional)</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">siggly.co/</span>
                <Input
                  id="slug"
                  type="text"
                  placeholder="my-link"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>
              
              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && !editingLink && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    AI Suggestions:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {aiSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomSlug(suggestion)}
                        className="text-xs border-violet-200 hover:bg-violet-50"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                type="text"
                placeholder="work, important, project"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="border-purple-200 focus:border-purple-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date (optional)</Label>
              <Input
                id="expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="border-purple-200 focus:border-purple-400"
              />
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={resetModal}
              variant="outline" 
              className="flex-1 border-purple-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateLink}
              className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              disabled={!newUrl}
            >
              {editingLink ? 'Update' : 'Create'} Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
