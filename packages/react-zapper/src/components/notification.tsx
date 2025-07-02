import React from 'react'

interface NotificationProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
}

const Notification: React.FC<NotificationProps> = ({
  icon,
  title,
  subtitle,
}) => {
  return (
    <div className="flex items-center gap-2">
      {icon && <div>{icon}</div>}

      <div>
        <div className="font-bold text-base text-primary">{title}</div>
        {subtitle && (
          <div className="text-sm text-muted-foreground">{subtitle}</div>
        )}
      </div>
    </div>
  )
}

export default Notification
