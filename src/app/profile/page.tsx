"use client"

import { useState } from "react"
import { ArrowLeft, Trophy, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const savingsData = [
  { rank: 1, week: "This Week", amount: 12.5, items: 8 },
  { rank: 2, week: "Last Week", amount: 8.75, items: 6 },
  { rank: 3, week: "2 Weeks Ago", amount: 15.2, items: 12 },
  { rank: 4, week: "3 Weeks Ago", amount: 6.3, items: 4 },
  { rank: 5, week: "4 Weeks Ago", amount: 11.8, items: 9 },
]

const achievements = [
  { title: "Smart Shopper", description: "Saved £50+ in a month", icon: "🏆", unlocked: true },
  { title: "Bargain Hunter", description: "Found 20+ deals", icon: "🎯", unlocked: true },
  { title: "Price Detective", description: "Corrected 10+ prices", icon: "🕵️", unlocked: false },
]

export default function ProfilePage() {
  const [selectedTab, setSelectedTab] = useState("savings")
  const totalSavings = savingsData.reduce((sum, week) => sum + week.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-primary-200 p-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <Link href="/">
            <ArrowLeft className="w-6 h-6 text-primary-600 hover:text-primary-700 transition-colors" />
          </Link>
          <h1 className="text-lg font-semibold text-primary-800">My Profile</h1>
          <div className="w-6"></div>
        </div>
      </header>

      {/* Profile Summary */}
      <div className="p-4 animate-fade-in">
        <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👤</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Smart Shopper</h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-primary-100 text-sm">Total Saved</p>
                <p className="text-2xl font-bold">£{totalSavings.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-primary-100 text-sm">Items Tracked</p>
                <p className="text-2xl font-bold">{savingsData.reduce((sum, week) => sum + week.items, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-4">
        <div className="flex bg-white rounded-lg p-1 border border-primary-200">
          <Button
            variant={selectedTab === "savings" ? "default" : "ghost"}
            onClick={() => setSelectedTab("savings")}
            className={`flex-1 transition-all duration-300 ${selectedTab === "savings" ? "bg-primary-600 text-white" : "text-primary-600"}`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Savings
          </Button>
          <Button
            variant={selectedTab === "achievements" ? "default" : "ghost"}
            onClick={() => setSelectedTab("achievements")}
            className={`flex-1 transition-all duration-300 ${selectedTab === "achievements" ? "bg-primary-600 text-white" : "text-primary-600"}`}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Achievements
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-4">
        {selectedTab === "savings" && (
          <div className="space-y-3 animate-fade-in">
            <h3 className="text-lg font-semibold text-primary-800 mb-4">Weekly Savings Rankings</h3>
            {savingsData.map((week, index) => (
              <Card
                key={week.rank}
                className={`border-primary-200 bg-white/90 backdrop-blur-sm transition-all duration-500 hover:scale-105 ${
                  week.rank === 1 ? "ring-2 ring-primary-400 shadow-lg" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          week.rank === 1
                            ? "bg-yellow-500"
                            : week.rank === 2
                              ? "bg-gray-400"
                              : week.rank === 3
                                ? "bg-amber-600"
                                : "bg-primary-500"
                        }`}
                      >
                        {week.rank === 1 ? "🥇" : week.rank === 2 ? "🥈" : week.rank === 3 ? "🥉" : week.rank}
                      </div>
                      <div>
                        <p className="font-semibold text-primary-800">{week.week}</p>
                        <p className="text-sm text-primary-600">{week.items} items tracked</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-700">£{week.amount.toFixed(2)}</p>
                      <p className="text-sm text-primary-600">saved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedTab === "achievements" && (
          <div className="space-y-3 animate-fade-in">
            <h3 className="text-lg font-semibold text-primary-800 mb-4">Your Achievements</h3>
            {achievements.map((achievement, index) => (
              <Card
                key={achievement.title}
                className={`border-primary-200 transition-all duration-500 ${
                  achievement.unlocked ? "bg-white/90 backdrop-blur-sm" : "bg-gray-100/90"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`text-3xl transition-all duration-300 ${achievement.unlocked ? "scale-100" : "scale-75 grayscale"}`}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${achievement.unlocked ? "text-primary-800" : "text-gray-500"}`}>
                          {achievement.title}
                        </h4>
                        {achievement.unlocked && (
                          <Badge className="bg-primary-100 text-primary-700 text-xs">Unlocked</Badge>
                        )}
                      </div>
                      <p className={`text-sm ${achievement.unlocked ? "text-primary-600" : "text-gray-400"}`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
