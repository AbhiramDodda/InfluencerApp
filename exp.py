from build import celery

celery.send_task('app.send_daily_reminders')