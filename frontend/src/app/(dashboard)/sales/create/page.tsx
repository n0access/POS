'use client'

import { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Divider,
  InputAdornment,
  Autocomplete,
  Chip,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material'

interface Product {
  id: number
  name: string
  sku: string
  unit_price: number
  quantity_in_stock: number
  category?: string
  description?: string
}

interface Customer {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
}

interface CartItem {
  id: number
  product_id: number
  name: string
  sku: string
  price: number
  quantity: number
  total: number
}

const CreateSalePage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Django backend base URL
  const API_BASE_URL = 'http://localhost:8000/api'

  // Fetch products and customers on component mount
  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/products/`, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data.results || data) // Handle paginated or non-paginated response
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/customers/`, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (!response.ok) throw new Error('Failed to fetch customers')
      const data = await response.json()
      setCustomers(data.results || data) // Handle paginated or non-paginated response
      setLoading(false)
    } catch (err) {
      setError('Failed to load customers')
      console.error(err)
      setLoading(false)
    }
  }

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Add product to cart
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product_id === product.id)

    if (existingItem) {
      if (existingItem.quantity < product.quantity_in_stock) {
        updateQuantity(product.id, existingItem.quantity + 1)
      } else {
        setError(`Cannot add more. Only ${product.quantity_in_stock} in stock.`)
      }
    } else {
      setCart([...cart, {
        id: cart.length + 1,
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.unit_price,
        quantity: 1,
        total: product.unit_price
      }])
    }
  }

  // Update quantity
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId)
      return
    }

    // Check stock availability
    const product = products.find(p => p.id === productId)
    if (product && newQuantity > product.quantity_in_stock) {
      setError(`Cannot add more. Only ${product.quantity_in_stock} in stock.`)
      return
    }

    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
        : item
    ))
    setError(null)
  }

  // Remove from cart
  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = (subtotal * discount) / 100
  const tax = (subtotal - discountAmount) * 0.1 // 10% tax - adjust based on your needs
  const total = subtotal - discountAmount + tax

  // Process sale
  const processSale = async () => {
    if (cart.length === 0) {
      setError('Cart is empty!')
      return
    }

    setError(null)
    setSuccess(null)

    try {
      const saleData = {
        customer: selectedCustomer?.id || null,
        items: cart.map(item => ({
          product: item.product_id,
          quantity: item.quantity,
          unit_price: item.price
        })),
        subtotal: subtotal.toFixed(2),
        discount_percentage: discount,
        discount_amount: discountAmount.toFixed(2),
        tax_amount: tax.toFixed(2),
        total_amount: total.toFixed(2),
        payment_method: paymentMethod,
        notes: notes,
        status: 'completed'
      }

      const response = await fetch(`${API_BASE_URL}/sales/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to process sale')
      }

      const result = await response.json()

      // Clear form after successful processing
      setCart([])
      setSelectedCustomer(null)
      setDiscount(0)
      setNotes('')
      setSuccess(`Sale processed successfully! Order #${result.id}`)

      // Refresh products to update stock
      fetchProducts()
    } catch (err: any) {
      setError(err.message || 'Failed to process sale. Please try again.')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Create Sale/Order
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      </Grid>

      {/* Left side - Product selection */}
      <Grid item xs={12} md={7}>
        <Card>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{product.name}</Typography>
                          {product.category && <Chip label={product.category} size="small" />}
                        </Box>
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>${product.unit_price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={product.quantity_in_stock}
                          size="small"
                          color={product.quantity_in_stock > 10 ? 'success' : product.quantity_in_stock > 0 ? 'warning' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => addToCart(product)}
                          disabled={product.quantity_in_stock === 0}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Right side - Cart and checkout */}
      <Grid item xs={12} md={5}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Order Details
            </Typography>

            {/* Customer Selection */}
            <Autocomplete
              value={selectedCustomer}
              onChange={(event, newValue) => setSelectedCustomer(newValue)}
              options={customers}
              getOptionLabel={(option) => {
                const name = option.first_name || option.last_name
                  ? `${option.first_name || ''} ${option.last_name || ''}`.trim()
                  : option.username
                return `${name} - ${option.email}`
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Customer (Optional)" fullWidth sx={{ mb: 2 }} />
              )}
            />

            <Divider sx={{ my: 2 }} />

            {/* Cart Items */}
            <Typography variant="subtitle1" gutterBottom>
              Cart Items
            </Typography>

            {cart.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                Cart is empty
              </Typography>
            ) : (
              <TableContainer sx={{ mb: 2, maxHeight: 300, overflow: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="body2">{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.sku}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>${item.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => removeFromCart(item.product_id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Payment Details */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Discount %"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    label="Payment Method"
                  >
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="card">Card</MenuItem>
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    <MenuItem value="mobile_money">Mobile Money</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Totals */}
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Subtotal:</Typography>
                <Typography>${subtotal.toFixed(2)}</Typography>
              </Box>
              {discount > 0 && (
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Discount ({discount}%):</Typography>
                  <Typography color="error">-${discountAmount.toFixed(2)}</Typography>
                </Box>
              )}
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Tax (10%):</Typography>
                <Typography>${tax.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">${total.toFixed(2)}</Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={processSale}
              disabled={cart.length === 0}
            >
              Process Sale
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CreateSalePage
