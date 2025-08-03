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
  TablePagination,
  Tabs,
  Tab
} from '@mui/material'
import {
  Print as PrintIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

interface Invoice {
  id: number
  invoice_number: string
  sale_id: string
  customer_name: string
  customer_email: string
  customer_address: string
  invoice_date: string
  due_date: string
  payment_status: 'pending' | 'paid' | 'overdue' | 'partial'
  subtotal: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  amount_paid: number
  balance_due: number
  payment_method: string
  notes: string
  terms_conditions: string
  items: InvoiceItem[]
  created_at: string
}

interface InvoiceItem {
  id: number
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number
  total: number
}

interface Sale {
  id: number
  sale_id: string
  customer_name: string
  customer_email: string
  total_amount: number
  payment_status: string
  created_at: string
}

const InvoicesPage = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // View Invoice State
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  // Generate Invoice State
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [sales, setSales] = useState<Sale[]>([])
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [invoiceTemplate, setInvoiceTemplate] = useState('standard')

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFromFilter, setDateFromFilter] = useState<Date | null>(null)
  const [dateToFilter, setDateToFilter] = useState<Date | null>(null)

  // Pagination
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const API_BASE_URL = 'http://localhost:8000/api'

  useEffect(() => {
    fetchInvoices()
    fetchSales()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [invoices, searchTerm, statusFilter, dateFromFilter, dateToFilter])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/invoices/`, {
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Failed to fetch invoices')
      const data = await response.json()
      setInvoices(data.results || data)
    } catch (err) {
      setError('Failed to load invoices')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSales = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales/?status=completed`, {
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Failed to fetch sales')
      const data = await response.json()
      setSales(data.results || data)
    } catch (err) {
      console.error('Failed to fetch sales:', err)
    }
  }

  const applyFilters = () => {
    let filtered = invoices

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.sale_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.payment_status === statusFilter)
    }

    // Date range filter
    if (dateFromFilter) {
      filtered = filtered.filter(invoice =>
        new Date(invoice.invoice_date) >= dateFromFilter
      )
    }

    if (dateToFilter) {
      filtered = filtered.filter(invoice =>
        new Date(invoice.invoice_date) <= dateToFilter
      )
    }

    setFilteredInvoices(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'pending': return 'warning'
      case 'overdue': return 'error'
      case 'partial': return 'info'
      default: return 'default'
    }
  }

  const isOverdue = (dueDate: string, paymentStatus: string) => {
    return new Date(dueDate) < new Date() && paymentStatus !== 'paid'
  }

  const generateInvoiceFromSale = async () => {
    if (!selectedSale) {
      setError('Please select a sale')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/invoices/generate_from_sale/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sale_id: selectedSale.id,
          template: invoiceTemplate
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate invoice')
      }

      const result = await response.json()
      setSuccess(`Invoice generated successfully! Invoice #${result.invoice_number}`)
      setGenerateDialogOpen(false)
      setSelectedSale(null)
      fetchInvoices()
    } catch (err: any) {
      setError(err.message || 'Failed to generate invoice')
    }
  }

  const handlePrintInvoice = async (invoiceId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/pdf/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/pdf' }
      })

      if (!response.ok) throw new Error('Failed to generate PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      setError('Failed to print invoice')
      console.error(err)
    }
  }

  const handleEmailInvoice = async (invoiceId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to send email')

      setSuccess('Invoice sent successfully!')
    } catch (err) {
      setError('Failed to send invoice')
      console.error(err)
    }
  }

  const handleMarkAsPaid = async (invoiceId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/mark_paid/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to mark as paid')

      setSuccess('Invoice marked as paid!')
      fetchInvoices()
    } catch (err) {
      setError('Failed to mark invoice as paid')
      console.error(err)
    }
  }

  const paginatedInvoices = filteredInvoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const renderViewInvoiceDialog = () => (
    <Dialog
      open={viewDialogOpen}
      onClose={() => setViewDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Invoice Details - {selectedInvoice?.invoice_number}</DialogTitle>
      <DialogContent>
        {selectedInvoice && (
          <Grid container spacing={2}>
            {/* Invoice Header */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Invoice Information</Typography>
              <Typography>Invoice #: {selectedInvoice.invoice_number}</Typography>
              <Typography>Sale #: {selectedInvoice.sale_id}</Typography>
              <Typography>Date: {new Date(selectedInvoice.invoice_date).toLocaleDateString()}</Typography>
              <Typography>Due Date: {new Date(selectedInvoice.due_date).toLocaleDateString()}</Typography>
              <Typography>
                Status:
                <Chip
                  label={selectedInvoice.payment_status.toUpperCase()}
                  color={getStatusColor(selectedInvoice.payment_status) as any}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Grid>

            {/* Customer Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Customer Information</Typography>
              <Typography>{selectedInvoice.customer_name}</Typography>
              <Typography>{selectedInvoice.customer_email}</Typography>
              <Typography component="div">
                <div dangerouslySetInnerHTML={{ __html: selectedInvoice.customer_address.replace(/\n/g, '<br/>') }} />
              </Typography>
            </Grid>

            {/* Items Table */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2 }}>Items</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Quantity</TableCell>
