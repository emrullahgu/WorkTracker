const fetch = require('node-fetch')

exports.handler = async function(event, context) {
  try {
    // Günlük hatırlatma endpoint'ini çağır
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/cron/daily-task-reminder`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      }
    })

    const data = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Günlük hatırlatma tamamlandı',
        data
      })
    }
  } catch (error) {
    console.error('Günlük hatırlatma hatası:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
