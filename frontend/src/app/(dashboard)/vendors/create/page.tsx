'use client'

import { useState } from 'react'
import {
  Typography, TextField, MenuItem, Grid, Paper, Button, Box
} from '@mui/material'
import { useRouter } from 'next/navigation'

const paymentTerms = [
  'NET7', 'NET14', 'NET30', 'NET45', 'NET60', 'NET90', 'COD', 'PREPAID', 'OTHER'
]

const paymentMethods = ['CASH', 'CREDIT', 'CHECK', 'BANK', 'OTHER']

const CreateVendorPage = () => {
  const router = useRouter()
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:8000/api/vendors/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Token 989701b42872aae835d0decab95d24e81e6c2689'
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push('/vendors')
      } else {
        const errText = await res.text()
        console.error('❌ API Error:', errText)
        alert('Error creating vendor')
      }
    } catch (err) {
      console.error('❌ Network error:', err)
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='h5' gutterBottom>Create New Vendor</Typography>

      <Paper elevation={2} sx={{ p: 4, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label='Company Name'
                name='company_name'
                value={formData.company_name}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Contact Name'
                name='contact_name'
                value={formData.contact_name}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Phone Number'
                name='phone_number'
                value={formData.phone_number}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Address Line 1'
                name='address_line1'
                value={formData.address_line1}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Address Line 2'
                name='address_line2'
                value={formData.address_line2}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label='City'
                name='city'
                value={formData.city}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label='State'
                name='state'
                value={formData.state}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label='Zip Code'
                name='zip_code'
                value={formData.zip_code}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Website'
                name='website'
                value={formData.website}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

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
    </Box>
  )
}

export default CreateVendorPage
