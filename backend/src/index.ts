import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { env } from 'hono/adapter'
import 'dotenv/config'

const app = new Hono()

// Enable CORS
app.use(
  cors({
    origin: 'http://localhost:5000',
  }),
)

app.get('/', (c) => {
  return c.json({'status': 'active'})
})

app.get('/whois-info', async (c) => {
  const domain = c.req.query('domain')
  const type = c.req.query('type')
  const { WHOIS_API_KEY } = env<{ WHOIS_API_KEY: string }>(c)

  try {
    if (!domain || !type) {
      throw new Error()
    }
    const response = await fetch(
      `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${WHOIS_API_KEY}&domainName=${domain}&outputFormat=JSON`,
    )
    const data = await response.json()

    if (type === 'domain') {
      const domainInfo = {
        'domainName': data.WhoisRecord.domainName,
        'registrarName': data.WhoisRecord.registrarName,
        'registrationDate': data.WhoisRecord.createdDate,
        'expirationDate': data.WhoisRecord.expiresDate,
        'estimatedDomainAge': data.WhoisRecord.estimatedDomainAge,
        'hostnames': data.WhoisRecord.nameServers.hostNames.map((hostname: string) => 
          hostname.length > 25 ? hostname.substring(0, 22) + '...' : hostname
        ).join(', '),
      }
      return c.json({ domainInfo })
    } else if (type === 'contact') {
      const contactInfo = {
        'registrantName': data.WhoisRecord.registrant.name,
        'technicalContactName': data.WhoisRecord.technicalContact.name,
        'administrativeContactName': data.WhoisRecord.administrativeContact.name,
        'contactEmail': data.WhoisRecord.registrant.email,
      }
      return c.json({ contactInfo })
    } else {
      return c.json({ error: 'Invalid type parameter' }, 400)
    }
  } catch (error) {
    return c.json({ error: 'Domain lookup failed' }, 400)
  }
})

const port = parseInt(process.env.PORT || '3000')
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
