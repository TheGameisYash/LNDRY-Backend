"use client"

import React, { useState } from "react"
import { Image as ImageIcon, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  value?: string | null
  onChange: (url: string) => void
  disabled?: boolean
  label?: string
  helperText?: React.ReactNode
}

export function ImageUpload({ value, onChange, disabled, label, helperText }: ImageUploadProps) {
  const [loading, setLoading] = useState(false)

  const handleUpload = () => {
    // Simulate image upload by returning a nice placeholder from the LNDRY assets
    setLoading(true)
    setTimeout(() => {
      onChange("/lndry-assets/banners/first-pickup-v1.png")
      setLoading(false)
    }, 800)
  }

  return (
    <div className="space-y-2 w-full">
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <div className="flex flex-col items-center justify-center">
        {value ? (
          <div className="relative w-40 h-40 rounded-xl overflow-hidden border">
            <img src={value || undefined} alt="Uploaded Image" className="w-full h-full object-cover" />
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange("")}
              className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1 shadow hover:bg-rose-600 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={disabled || loading ? undefined : handleUpload}
            className="w-full h-40 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-500/50 hover:bg-muted/10 transition"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              {loading ? "Uploading..." : "Upload an Image"}
            </span>
          </div>
        )}
      </div>
      {helperText && <div className="text-xs text-muted-foreground">{helperText}</div>}
    </div>
  )
}
