'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface SpendingChartProps {
  groups: any[]
  currentUserId: string
}

export default function SpendingChart({ groups, currentUserId }: SpendingChartProps) {
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    const fetchChartData = async () => {
      // Get expenses from last 7 days
      const days = 7
      const data = []
      const labels = []

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        labels.push(date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }))

        let dayTotal = 0
        for (const group of groups) {
          try {
            const response = await fetch(`/api/expenses?groupId=${group.id}`)
            if (response.ok) {
              const expenses = await response.json()
              const dayExpenses = expenses.filter((exp: any) => {
                const expDate = new Date(exp.date || exp.created_at)
                return expDate.toISOString().split('T')[0] === dateStr
              })
              dayTotal += dayExpenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)
            }
          } catch (error) {
            console.error('Error fetching chart data:', error)
          }
        }
        data.push(dayTotal)
      }

      setChartData({
        labels,
        datasets: [
          {
            label: 'Wydatki',
            data,
            borderColor: '#00E0FF',
            backgroundColor: 'rgba(0, 224, 255, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#00E0FF',
            pointBorderColor: '#00E0FF',
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      })
    }

    if (groups.length > 0) {
      fetchChartData()
    }
  }, [groups, currentUserId])

  if (!chartData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="glass-card glass-card-hover border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#00E0FF]" />
              Aktywność wydatków
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-gray-400">
              Ładowanie danych...
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-6"
    >
      <Card className="glass-card glass-card-hover border-white/10 hover:border-[#00E0FF]/50 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#00E0FF]" />
            Aktywność wydatków (7 dni)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#00E0FF',
                    borderColor: '#00E0FF',
                    borderWidth: 1,
                  },
                },
                scales: {
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                      color: '#9CA3AF',
                    },
                  },
                  y: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                      color: '#9CA3AF',
                    },
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

