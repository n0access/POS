'use client'

import { useState } from 'react'
import {
  Typography, TextField, MenuItem, Grid, Paper, Button, Box
} from '@mui/material'
import { useRouter } from 'next/navigation'

const categories = [
  'Bakery', 'Beverage', 'Candy', 'Chocolate', 'Deli Cold', 'Deli General',
  'Food', 'Grocery', 'HBA', 'Organic', 'Paper Goods', 'Pet Food', 'Snacks', 'Toy'
]

const CreateItemPage = () => {
  const router = useRouter()

  const [formData, setFormData] = useState({
    item_name: '',
    barcode: '',
    product_category: '',
    unit_price: '',
    unit_cost: '',
    quantity: '',
    status: 'Active'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('http://localhost:8000/api/inventory/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Token 989701b42872aae835d0decab95d24e81e6c2689'
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        router.push('/items')
      } else {
        const errText = await res.text()
        console.error('❌ API Error:', errText)
        alert('Error creating item')
      }
    } catch (err) {
      console.error('❌ Network error:', err)
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant='h5' gutterBottom>Create New Item</Typography>

      <Paper elevation={2} sx={{ p: 4, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label='Item Name'
                name='item_name'
                value={formData.item_name}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Barcode'
                name='barcode'
                value={formData.barcode}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label='Category'
                name='product_category'
                select
                value={formData.product_category}
                onChange={handleChange}
                required
                fullWidth
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat.toUpperCase()}>
                    {cat}
                  </MenuItem>
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

            <Grid item xs={12} sm={4}>
              <TextField
                label='Unit Price'
                name='unit_price'
                type='number'
                value={formData.unit_price}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label='Unit Cost'
                name='unit_cost'
                type='number'
                value={formData.unit_cost}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label='Quantity'
                name='quantity'
                type='number'
                value={formData.quantity}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <Button type='submit' variant='contained' color='primary'>
                Save Item
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  )
}

export default CreateItemPage
