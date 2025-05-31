'use client'

import { useEffect, useState } from 'react'
import {
  Typography, TextField, MenuItem, Grid, Paper, Button, Box, Table, TableHead,
  TableRow, TableCell, TableBody, Divider
} from '@mui/material'

const paymentTerms = [
  'NET7', 'NET14', 'NET30', 'NET45', 'NET60', 'NET90', 'COD', 'PREPAID', 'OTHER'
]
const paymentMethods = ['CASH', 'CREDIT', 'CHECK', 'BANK', 'OTHER']

const CreateVendorPage = () => {
  const [vendors, setVendors] = useState([])
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    phone_number: '',
    email: '',
    website: '',
    terms: 'NET30',
    payment_method: 'CHECK',
    status: 'Active',
    notes: ''
  })

  // Fetch vendors from backend
  const fetchVendors = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/vendors/')
      if (res.ok) {
        const data = await res.json()
        setVendors(data)
      } else {
        console.error('Failed to fetch vendors')
      }
    } catch (error) {
      console.error('Network error:', error)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:8000/api/vendors/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setFormData({
          company_name: '',
          contact_name: '',
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          zip_code: '',
          phone_number: '',
          email: '',
          website: '',
          terms: 'NET30',
          payment_method: 'CHECK',
          status: 'Active',
          notes: ''
        })
        fetchVendors()
      } else {
        const errText = await res.text()
        console.error('API error:', errText)
        alert('Error creating vendor')
      }
    } catch (err) {
      console.error('Network error:', err)
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='h5' gutterBottom>Create New Vendor</Typography>

      <Paper elevation={2} sx={{ p: 4, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* FORM FIELDS HERE */}
            {[
              { label: 'Company Name', name: 'company_name' },
              { label: 'Contact Name', name: 'contact_name' },
              { label: 'Phone Number', name: 'phone_number' },
              { label: 'Email', name: 'email', type: 'email' },
              { label: 'Address Line 1', name: 'address_line1' },
              { label: 'Address Line 2', name: 'address_line2' },
              { label: 'City', name: 'city' },
              { label: 'State', name: 'state' },
              { label: 'Zip Code', name: 'zip_code' },
              { label: 'Website', name: 'website' }
            ].map((field, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <TextField
                  label={field.label}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  type={field.type || 'text'}
                  fullWidth
                  required={['company_name', 'address_line1', 'city', 'state', 'zip_code'].includes(field.name)}
                />
              </Grid>
            ))}

            <Grid item xs={12} sm={6}>
              <TextField
                label='Payment Terms'
                name='terms'
                select
                value={formData.terms}
                onChange={handleChange}
                fullWidth
              >
                {paymentTerms.map(term => (
                  <MenuItem key={term} value={term}>{term}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Payment Method'
                name='payment_method'
                select
                value={formData.payment_method}
                onChange={handleChange}
                fullWidth
              >
                {paymentMethods.map(method => (
                  <MenuItem key={method} value={method}>{method}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Status'
                name='status'
                select
                value={formData.status}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value='Active'>Active</MenuItem>
                <MenuItem value='Inactive'>Inactive</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label='Notes'
                name='notes'
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Button type='submit' variant='contained' color='primary'>
                Save Vendor
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Divider sx={{ my: 5 }} />

      <Typography variant='h6' gutterBottom>Existing Vendors</Typography>
      <Paper elevation={1}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendors.length > 0 ? vendors.map((vendor: any, index) => (
              <TableRow key={index}>
                <TableCell>{vendor.company_name}</TableCell>
                <TableCell>{vendor.contact_name}</TableCell>
                <TableCell>{vendor.phone_number}</TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{vendor.status}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} align='center'>No vendors found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}

export default CreateVendorPage
