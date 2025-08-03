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
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  InputAdornment,
  Autocomplete,
  Tabs,
  Tab
} from '@mui/material'
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  FileCopy as DuplicateIcon,
  ShoppingCart as ConvertIcon,
  Print as PrintIcon,
  Send as SendIcon,
  Visibility as ViewIcon
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

interface Quote {
  id: number
  quote_id: string
  customer?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  customer_name: string
  total_amount: number
  subtotal: number
  discount_amount: number
  tax_amount: number
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  created_at: string
  valid_until: string
  items: QuoteItem[]
  notes?: string
}

interface QuoteItem {
  id: number
  product_id: number
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total: number
}

interface Product {
  id: number
  name: string
  sku: string
  unit_price: number
  quantity_in_stock: number
}

interface Customer {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
}

const QuotesPage = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Create/Edit Quote State
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [cart, setCart] = useState<QuoteItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [validUntil, setValidUntil] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const API_BASE_URL = 'http://localhost:8000/api'

  useEffect(() => {
    fetchQuotes()
    fetchProducts()
    fetchCustomers()
  }, [])

  const fetchQuotes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/`, {
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Failed to fetch quotes')
      const data = await response.json()
      setQuotes(data.results || data)
    } catch (err) {
      setError('Failed to load quotes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/products/`, {
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data.results || data)
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/customers/`, {
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Failed to fetch customers')
      const data = await response.json()
      setCustomers(data.results || data)
    } catch (err) {
      setError('Failed to load customers')
      console.error(err)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product_id === product.id)
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1)
    } else {
      setCart([...cart, {
        id: cart.length + 1,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: 1,
        unit_price: product.unit_price,
        total: product.unit_price
      }])
    }
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId)
      return
    }
    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity: newQuantity, total: item.unit_price * newQuantity }
        : item
    ))
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = (subtotal * discount) / 100
  const tax = (subtotal - discountAmount) * 0.1
  const total = subtotal - discountAmount + tax

  const handleCreateQuote = async () => {
    if (cart.length === 0) {
      setError('Quote items cannot be empty!')
      return
    }

    try {
      const quoteData = {
        customer: selectedCustomer?.id || null,
        items: cart.map(item => ({
          product: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        })),
        subtotal: subtotal.toFixed(2),
        discount_percentage: discount,
        discount_amount: discountAmount.toFixed(2),
        tax_amount: tax.toFixed(2),
        total_amount: total.toFixed(2),
        valid_until: validUntil?.toISOString().split('T')[0],
        notes: notes,
        status: 'draft'
      }

      const response = await fetch(`${API_BASE_URL}/quotes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create quote')
      }

      const result = await response.json()
      setSuccess(`Quote created successfully! Quote #${result.quote_id}`)
      resetForm()
      setCreateDialogOpen(false)
      fetchQuotes()
    } catch (err: any) {
      setError(err.message || 'Failed to create quote')
      console.error(err)
    }
  }

  const handleUpdateQuoteStatus = async (quoteId: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/${quoteId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update quote status')

      setSuccess(`Quote status updated to ${newStatus}`)
      fetchQuotes()
    } catch (err) {
      setError('Failed to update
