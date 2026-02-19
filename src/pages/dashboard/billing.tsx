import { Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const plans = [
  { name: 'Starter', price: '$0', features: ['5 projects', '100 assets', '50 research credits/mo'] },
  { name: 'Pro', price: '$29', features: ['Unlimited projects', 'Unlimited assets', '500 research credits/mo', 'Team collaboration'] },
  { name: 'Team', price: '$99', features: ['Everything in Pro', '10 seats', '2000 research credits/mo', 'Admin tools'] },
]

export function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Checkout / Billing</h1>
        <p className="text-muted-foreground">
          Plan purchase and management
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="relative">
            {plan.name === 'Pro' && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-white">
                Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold text-foreground">
                  {plan.price}
                </span>
                /month
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.name === 'Pro' ? 'default' : 'outline'}
                className="w-full"
              >
                {plan.price === '$0' ? 'Current plan' : 'Select plan'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <CardDescription>Stripe Elements payment form</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input placeholder="Coupon code" className="max-w-xs" />
          </div>
          <Button variant="outline">View invoice history</Button>
        </CardContent>
      </Card>
    </div>
  )
}
