"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import {
  IndianRupee,
  ShoppingCart,
  Shirt,
  Users,
  Activity,
  Clock,
  FileText,
  Bike,
  TrendingUp,
  Package,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/PageHeader"
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
import { StatCard } from "@/components/dashboard/StatCard"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { CategoryDonut } from "@/components/dashboard/CategoryDonut"
import { OrdersByHourChart } from "@/components/dashboard/OrdersByHourChart"
import { RecentOrders } from "@/components/dashboard/RecentOrders"
import { PendingActions } from "@/components/dashboard/PendingActions"
import {
  useDashboardStats,
  useLiveStats,
  useRecentOrders,
  useCategoryRevenue,
} from "@/hooks/useDashboard"
import { formatShort, formatNumberShort } from "@/lib/utils"

type Period = "today" | "week" | "month" | "year"

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("week")
  const { data: stats, isLoading: statsLoading } = useDashboardStats(period)
  const { data: liveStats } = useLiveStats()
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders(10)
  const { data: categoryData, isLoading: categoryLoading } = useCategoryRevenue()

  return (
    <div className="space-y-6">
      {/* Page Header + Period Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="LNDRY Control Center"
          subtitle="Overview of laundry service marketplace performance"
        />
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="h-9">
            <TabsTrigger value="today" className="text-xs px-3">Today</TabsTrigger>
            <TabsTrigger value="week" className="text-xs px-3">This Week</TabsTrigger>
            <TabsTrigger value="month" className="text-xs px-3">This Month</TabsTrigger>
            <TabsTrigger value="year" className="text-xs px-3">This Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Live activity bar */}
      {liveStats && (
        <div className="flex items-center gap-4 rounded-lg bg-brand-50 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-brand-500" />
            <span className="font-medium text-brand-700">Live</span>
          </div>
          <span className="text-brand-600">
            {liveStats.activeOrders} active orders
          </span>
          <span className="text-brand-600">
            {liveStats.onlineRiders} employees active
          </span>
          <span className="text-brand-600 hidden sm:inline">
            Today: {formatShort(liveStats.todayRevenue)} · {liveStats.todayOrders} bookings
          </span>
        </div>
      )}

      {/* Stat Cards Row — 10 KPIs */}
      {statsLoading ? (
        <LoadingSkeleton variant="stat-card" count={10} />
      ) : stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Revenue"
            value={formatShort(stats.revenue.value)}
            change={stats.revenue.change}
            sparkline={stats.revenue.sparkline}
            icon={<IndianRupee className="h-4 w-4 text-white" />}
            variant="primary"
          />
          <StatCard
            label="Total Bookings"
            value={formatNumberShort(stats.orders.value)}
            change={stats.orders.change}
            sparkline={stats.orders.sparkline}
            icon={<ShoppingCart className="h-4 w-4 text-brand-500" />}
          />
          <StatCard
            label="Active Services"
            value={formatNumberShort(stats.products.value)}
            change={stats.products.change}
            icon={<Shirt className="h-4 w-4 text-brand-500" />}
          />
          <StatCard
            label="Customers"
            value={formatNumberShort(stats.customers.value)}
            change={stats.customers.change}
            icon={<Users className="h-4 w-4 text-brand-500" />}
          />
          <StatCard
            label="Pending Bookings"
            value={formatNumberShort(liveStats?.activeOrders ?? stats.pendingOrders)}
            icon={<Clock className="h-4 w-4 text-amber-500" />}
          />
          <StatCard
            label="Pending Applications"
            value={formatNumberShort(stats.lowStockCount)}
            icon={<FileText className="h-4 w-4 text-red-500" />}
          />
          <StatCard
            label="Active Employees"
            value={formatNumberShort(liveStats?.onlineRiders ?? stats.riders.active)}
            icon={<Bike className="h-4 w-4 text-green-500" />}
          />
          <StatCard
            label="Today's Bookings"
            value={formatShort(liveStats?.todayRevenue ?? stats.today.revenue)}
            icon={<IndianRupee className="h-4 w-4 text-brand-500" />}
          />
          <StatCard
            label="Avg Order Value"
            value={stats.orders.value > 0 ? formatShort(stats.revenue.value / stats.orders.value) : "₹0"}
            icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
          />
          <StatCard
            label="Completed Deliveries"
            value={formatNumberShort(stats.today.codCollections)}
            icon={<Package className="h-4 w-4 text-emerald-500" />}
          />
        </div>
      ) : null}

      {/* Charts Row: Revenue (60%) + Category Donut (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <RevenueChart />
        </div>
        <div className="lg:col-span-2">
          <CategoryDonut data={categoryData} isLoading={categoryLoading} />
        </div>
      </div>

      {/* Orders by Hour + Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <OrdersByHourChart />
        </div>
        <div className="lg:col-span-2">
          <PendingActions />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 gap-4">
        <RecentOrders data={recentOrders} isLoading={ordersLoading} />
      </div>
    </div>
  )
}
