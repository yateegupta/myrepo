'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import type { AutocompleteInputChangeReason } from '@mui/material/useAutocomplete'
import type { ChipProps } from '@mui/material/Chip'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useToast } from '@/components/ui/use-toast'
import { UserRole } from '@/types/prisma'

interface DrapeTypeOption {
  id: string
  name: string
  description?: string | null
}

interface SurgeryTypeOption {
  id: string
  name: string
  description?: string | null
  defaultDrapeTypeId?: string | null
  defaultDrapeType?: DrapeTypeOption | null
}

interface SurgeryDefaultsResponse {
  id: string
  name: string
  description?: string | null
  defaultDrapeType?: DrapeTypeOption | null
  defaultItems: Array<{
    id: string
    name: string
    description?: string | null
    defaultQuantity?: number | null
  }>
}

interface ItemCatalogEntry {
  id: string
  name: string
  description?: string | null
  unit?: string | null
}

type ItemChangeType = 'default' | 'added' | 'modified'

interface WizardItem {
  key: string
  itemId?: string
  name: string
  quantity: number
  notes?: string
  defaultQuantity?: number
  originalNotes?: string
  changeType: ItemChangeType
}

interface RemovedWizardItem {
  key: string
  itemId?: string
  name: string
  quantity: number
  notes?: string
  defaultQuantity?: number
}

interface SelectionState {
  id?: string
  name: string
}

interface StepDefinition {
  title: string
  description: string
}

const steps: StepDefinition[] = [
  {
    title: 'Drape Selection',
    description: 'Choose or confirm the drape pack that will anchor this order.',
  },
  {
    title: 'Surgery Selection',
    description: 'Identify the surgical procedure to pre-load recommended supplies.',
  },
  {
    title: 'Suggested Items Review',
    description: 'Review auto-suggested constituents before customizing the kit.',
  },
  {
    title: 'Customization',
    description: 'Adjust quantities, add or remove items, and capture specific notes.',
  },
  {
    title: 'Summary',
    description: 'Confirm selections and submit the completed order.',
  },
]

interface OrderWizardProps {
  submitterName?: string | null
  submitterRole: UserRole
}

const createKey = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`

const changeTypeChipConfig: Record<ItemChangeType, { label: string; color: ChipProps['color'] }> = {
  default: { label: 'Suggested', color: 'default' },
  added: { label: 'Added', color: 'primary' },
  modified: { label: 'Modified', color: 'warning' },
}

export default function OrderWizard({ submitterName, submitterRole }: OrderWizardProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [activeStep, setActiveStep] = useState(0)
  const [drapeOptions, setDrapeOptions] = useState<DrapeTypeOption[]>([])
  const [surgeryOptions, setSurgeryOptions] = useState<SurgeryTypeOption[]>([])
  const [isLoadingDrapes, setIsLoadingDrapes] = useState(true)
  const [isLoadingSurgeries, setIsLoadingSurgeries] = useState(true)
  const [drapeSelection, setDrapeSelection] = useState<SelectionState>({ name: '' })
  const [surgerySelection, setSurgerySelection] = useState<SelectionState>({ name: '' })
  const [drapeInputValue, setDrapeInputValue] = useState('')
  const [surgeryInputValue, setSurgeryInputValue] = useState('')
  const [drapeManuallyAdjusted, setDrapeManuallyAdjusted] = useState(false)
  const [recommendedDrape, setRecommendedDrape] = useState<DrapeTypeOption | null>(null)
  const [drapeRecommendationMessage, setDrapeRecommendationMessage] = useState<string | null>(null)
  const [items, setItems] = useState<WizardItem[]>([])
  const [removedItems, setRemovedItems] = useState<RemovedWizardItem[]>([])
  const [isFetchingDefaults, setIsFetchingDefaults] = useState(false)
  const [itemSearchQuery, setItemSearchQuery] = useState('')
  const [itemSearchResults, setItemSearchResults] = useState<ItemCatalogEntry[]>([])
  const [isSearchingItems, setIsSearchingItems] = useState(false)
  const [customItemName, setCustomItemName] = useState('')
  const [customItemQuantity, setCustomItemQuantity] = useState<number>(1)
  const [customizationNotes, setCustomizationNotes] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadDrapeTypes = async () => {
      setIsLoadingDrapes(true)
      try {
        const response = await fetch('/api/drape-types')
        if (!response.ok) {
          throw new Error('Unable to load drape types')
        }
        const data: DrapeTypeOption[] = await response.json()
        setDrapeOptions(data)
      } catch (error) {
        console.error(error)
        toast({
          title: 'Failed to load drape types',
          description: 'Please refresh the page or try again later.',
          variant: 'destructive',
        })
      } finally {
        setIsLoadingDrapes(false)
      }
    }

    loadDrapeTypes()
  }, [toast])

  useEffect(() => {
    const loadSurgeryTypes = async () => {
      setIsLoadingSurgeries(true)
      try {
        const response = await fetch('/api/surgery-types')
        if (!response.ok) {
          throw new Error('Unable to load surgery types')
        }
        const data: SurgeryTypeOption[] = await response.json()
        setSurgeryOptions(data)
      } catch (error) {
        console.error(error)
        toast({
          title: 'Failed to load surgery types',
          description: 'Please refresh the page or try again later.',
          variant: 'destructive',
        })
      } finally {
        setIsLoadingSurgeries(false)
      }
    }

    loadSurgeryTypes()
  }, [toast])

  useEffect(() => {
    if (!itemSearchQuery.trim()) {
      setItemSearchResults([])
      setIsSearchingItems(false)
      return
    }

    const controller = new AbortController()
    setIsSearchingItems(true)

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/items?search=${encodeURIComponent(itemSearchQuery.trim())}&limit=10`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Unable to search items')
        }
        const data = await response.json()
        setItemSearchResults(data.items ?? [])
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error)
          toast({
            title: 'Search failed',
            description: 'We could not retrieve catalog items. Please try again.',
            variant: 'destructive',
          })
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingItems(false)
        }
      }
    }, 400)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
      setIsSearchingItems(false)
    }
  }, [itemSearchQuery, toast])

  useEffect(() => {
    setSubmitError(null)
  }, [activeStep])

  const selectedDrapeOption = useMemo(() => {
    if (!drapeSelection.id) {
      return null
    }
    return drapeOptions.find((option) => option.id === drapeSelection.id) ?? null
  }, [drapeOptions, drapeSelection.id])

  const selectedSurgeryOption = useMemo(() => {
    if (!surgerySelection.id) {
      return null
    }
    return surgeryOptions.find((option) => option.id === surgerySelection.id) ?? null
  }, [surgeryOptions, surgerySelection.id])

  const handleDrapeChange = (_: unknown, value: DrapeTypeOption | string | null) => {
    if (!value) {
      setDrapeSelection({ name: '' })
      setDrapeInputValue('')
      setRecommendedDrape(null)
      setDrapeRecommendationMessage(null)
      return
    }

    if (typeof value === 'string') {
      const trimmed = value.trim()
      setDrapeSelection({ id: undefined, name: trimmed })
      setDrapeInputValue(trimmed)
      setDrapeManuallyAdjusted(true)
      setDrapeRecommendationMessage(null)
      return
    }

    setDrapeSelection({ id: value.id, name: value.name })
    setDrapeInputValue(value.name)
    setDrapeManuallyAdjusted(true)
    setDrapeRecommendationMessage(null)
  }

  const handleDrapeInputChange = (_event: unknown, newInputValue: string, reason: AutocompleteInputChangeReason) => {
    setDrapeInputValue(newInputValue)
    if (reason === 'input') {
      setDrapeSelection({ id: undefined, name: newInputValue })
      setDrapeManuallyAdjusted(true)
      setDrapeRecommendationMessage(null)
    }
  }

  const handleApplyRecommendedDrape = () => {
    if (!recommendedDrape) return
    setDrapeSelection({ id: recommendedDrape.id, name: recommendedDrape.name })
    setDrapeInputValue(recommendedDrape.name)
    setDrapeManuallyAdjusted(false)
    setDrapeRecommendationMessage(`Applied recommended drape "${recommendedDrape.name}".`)
  }

  const handleSurgeryChange = async (_: unknown, value: SurgeryTypeOption | string | null) => {
    if (!value) {
      setSurgerySelection({ name: '' })
      setSurgeryInputValue('')
      setRecommendedDrape(null)
      setDrapeRecommendationMessage(null)
      return
    }

    if (typeof value === 'string') {
      const trimmed = value.trim()
      setSurgerySelection({ id: undefined, name: trimmed })
      setSurgeryInputValue(trimmed)
      setRecommendedDrape(null)
      setDrapeRecommendationMessage(null)
      return
    }

    setSurgerySelection({ id: value.id, name: value.name })
    setSurgeryInputValue(value.name)
    await loadSurgeryDefaults(value.id)
  }

  const handleSurgeryInputChange = (_event: unknown, newInputValue: string, reason: AutocompleteInputChangeReason) => {
    setSurgeryInputValue(newInputValue)
    if (reason === 'input') {
      setSurgerySelection({ id: undefined, name: newInputValue })
    }
  }

  const loadSurgeryDefaults = async (surgeryId: string) => {
    setIsFetchingDefaults(true)
    try {
      const response = await fetch(`/api/surgery-types/${surgeryId}/defaults`)
      if (!response.ok) {
        throw new Error('Unable to load surgery defaults')
      }
      const data: SurgeryDefaultsResponse = await response.json()
      setRecommendedDrape(data.defaultDrapeType ?? null)

      if (data.defaultDrapeType) {
        if (!drapeManuallyAdjusted) {
          setDrapeSelection({ id: data.defaultDrapeType.id, name: data.defaultDrapeType.name })
          setDrapeInputValue(data.defaultDrapeType.name)
          setDrapeRecommendationMessage(`Default drape "${data.defaultDrapeType.name}" applied for this surgery.`)
        } else {
          setDrapeRecommendationMessage(`This surgery recommends drape "${data.defaultDrapeType.name}".`)
        }
      } else {
        setDrapeRecommendationMessage(null)
      }

      if (data.defaultItems && data.defaultItems.length > 0) {
        const defaults = data.defaultItems.map((item) => {
          const quantity = item.defaultQuantity && item.defaultQuantity > 0 ? item.defaultQuantity : 1
          return {
            key: createKey('default'),
            itemId: item.id,
            name: item.name,
            quantity,
            defaultQuantity: quantity,
            originalNotes: '',
            changeType: 'default' as ItemChangeType,
          }
        })

        setItems(defaults)
        setRemovedItems([])
      } else {
        setItems([])
        setRemovedItems([])
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Defaults unavailable',
        description: 'We could not load suggestions for this surgery. You can still customize items manually.',
        variant: 'destructive',
      })
    } finally {
      setIsFetchingDefaults(false)
    }
  }

  const updateItem = (key: string, updates: Partial<WizardItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) {
          return item
        }
        const updated: WizardItem = { ...item, ...updates }

        if (item.changeType === 'added') {
          return updated
        }

        const quantityChanged =
          updated.defaultQuantity !== undefined && updated.quantity !== updated.defaultQuantity
        const notesChanged = (updated.notes?.trim() || '') !== (item.originalNotes?.trim() || '')

        updated.changeType = quantityChanged || notesChanged ? 'modified' : 'default'
        return updated
      })
    )
  }

  const handleRemoveItem = (key: string) => {
    const target = items.find((item) => item.key === key)
    if (!target) {
      return
    }

    setItems((prev) => prev.filter((item) => item.key !== key))

    if (target.changeType !== 'added') {
      setRemovedItems((prev) => [...prev, { ...target }])
    }
  }

  const removeFromRemovedItems = (itemId?: string, name?: string) => {
    setRemovedItems((prev) =>
      prev.filter((item) => {
        if (itemId) {
          return item.itemId !== itemId
        }
        if (name) {
          return item.name.toLowerCase() !== name.toLowerCase()
        }
        return true
      })
    )
  }

  const handleAddItemFromCatalog = (entry: ItemCatalogEntry) => {
    if (items.some((item) => item.itemId === entry.id || item.name.toLowerCase() === entry.name.toLowerCase())) {
      toast({
        title: 'Item already added',
        description: `${entry.name} is already part of this order. Adjust the quantity instead.`,
      })
      return
    }

    removeFromRemovedItems(entry.id, entry.name)

    setItems((prev) => [
      ...prev,
      {
        key: createKey('catalog'),
        itemId: entry.id,
        name: entry.name,
        quantity: 1,
        defaultQuantity: undefined,
        originalNotes: '',
        changeType: 'added',
      },
    ])

    toast({
      title: 'Item added',
      description: `${entry.name} has been added to the order.`,
    })
  }

  const handleAddCustomItem = () => {
    const trimmedName = customItemName.trim()
    if (!trimmedName) {
      toast({
        title: 'Item name required',
        description: 'Enter a custom item name before adding it to the order.',
        variant: 'destructive',
      })
      return
    }

    if (items.some((item) => item.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast({
        title: 'Item already added',
        description: `${trimmedName} is already part of this order.`,
      })
      return
    }

    removeFromRemovedItems(undefined, trimmedName)

    const quantity = Number.isFinite(customItemQuantity) && customItemQuantity > 0 ? customItemQuantity : 1

    setItems((prev) => [
      ...prev,
      {
        key: createKey('custom'),
        name: trimmedName,
        quantity,
        defaultQuantity: undefined,
        originalNotes: '',
        changeType: 'added',
      },
    ])

    setCustomItemName('')
    setCustomItemQuantity(1)
    toast({
      title: 'Custom item added',
      description: `${trimmedName} has been included in this order.`,
    })
  }

  const canProceed = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return drapeSelection.name.trim().length > 0
      case 1:
        return surgerySelection.name.trim().length > 0
      case 2:
        return true
      case 3:
        return items.length > 0
      case 4:
        return items.length > 0 && !isSubmitting
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      await submitOrder()
      return
    }
    if (!canProceed(activeStep)) {
      toast({
        title: 'Incomplete step',
        description: 'Complete the required information before continuing.',
        variant: 'destructive',
      })
      return
    }
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    if (activeStep === 0) {
      return
    }
    setActiveStep((prev) => prev - 1)
  }

  const submitOrder = async () => {
    if (items.length === 0) {
      toast({
        title: 'Add at least one item',
        description: 'Orders must contain at least one constituent item.',
        variant: 'destructive',
      })
      setActiveStep(3)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    const payload: Record<string, unknown> = {
      items: items.map((item) => ({
        itemId: item.itemId,
        itemName: item.name,
        quantity: item.quantity,
        notes: item.notes?.trim() ? item.notes.trim() : undefined,
      })),
    }

    if (drapeSelection.id) {
      payload.drapeTypeId = drapeSelection.id
    } else if (drapeSelection.name.trim()) {
      payload.drapeTypeName = drapeSelection.name.trim()
    }

    if (surgerySelection.id) {
      payload.surgeryTypeId = surgerySelection.id
    } else if (surgerySelection.name.trim()) {
      payload.surgeryTypeName = surgerySelection.name.trim()
    }

    if (customizationNotes.trim()) {
      payload.customizationNotes = customizationNotes.trim()
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let message = 'Failed to submit order'
        try {
          const errorBody = await response.json()
          if (errorBody?.error) {
            message = errorBody.error
          }
        } catch (parseError) {
          console.error(parseError)
        }
        throw new Error(message)
      }

      setSuccessMessage('Order submitted successfully. Redirecting you now…')
      toast({
        title: 'Order submitted',
        description: 'Your order has been sent to fulfillment.',
      })

      const redirectTarget = submitterRole === UserRole.ADMIN ? '/dashboard' : '/'
      window.setTimeout(() => {
        router.push(redirectTarget)
      }, 1500)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit order'
      setSubmitError(message)
      toast({
        title: 'Submission failed',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Select a drape type
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start by choosing a drape pack from the catalog or enter a custom description tailored to this procedure.
              </Typography>
            </Box>
            <Autocomplete<DrapeTypeOption, false, false, true>
              value={drapeSelection.id ? selectedDrapeOption : drapeSelection.name || null}
              options={drapeOptions}
              freeSolo
              loading={isLoadingDrapes}
              onChange={handleDrapeChange}
              inputValue={drapeInputValue}
              onInputChange={handleDrapeInputChange}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option
                }
                return option.name
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="body1">{option.name}</Typography>
                  {option.description ? (
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  ) : null}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Drape type"
                  placeholder="Search drape types or type a custom name"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoadingDrapes ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            {drapeRecommendationMessage ? (
              <Alert
                severity="info"
                action={
                  recommendedDrape && drapeManuallyAdjusted ? (
                    <Button
                      color="inherit"
                      size="small"
                      startIcon={<RefreshIcon fontSize="small" />}
                      onClick={handleApplyRecommendedDrape}
                    >
                      Apply recommendation
                    </Button>
                  ) : undefined
                }
              >
                {drapeRecommendationMessage}
              </Alert>
            ) : null}
            {selectedDrapeOption?.description ? (
              <Alert severity="success" icon={<CheckCircleIcon fontSize="inherit" />}>
                {selectedDrapeOption.description}
              </Alert>
            ) : null}
          </Stack>
        )
      case 1:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Choose a surgery profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Selecting a surgery automatically retrieves its recommended drape and constituent items.
              </Typography>
            </Box>
            <Autocomplete<SurgeryTypeOption, false, false, true>
              value={surgerySelection.id ? selectedSurgeryOption : surgerySelection.name || null}
              options={surgeryOptions}
              freeSolo
              loading={isLoadingSurgeries}
              onChange={handleSurgeryChange}
              inputValue={surgeryInputValue}
              onInputChange={handleSurgeryInputChange}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option
                }
                return option.name
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="body1">{option.name}</Typography>
                  {option.description ? (
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  ) : null}
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Surgery type"
                  placeholder="Search surgery types or enter a custom description"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoadingSurgeries || isFetchingDefaults ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            {isFetchingDefaults ? (
              <Alert severity="info">Loading recommended drape and items…</Alert>
            ) : null}
            {recommendedDrape && drapeManuallyAdjusted ? (
              <Alert
                severity="info"
                action={
                  <Button color="inherit" size="small" onClick={handleApplyRecommendedDrape}>
                    Use recommended drape
                  </Button>
                }
              >
                Recommended drape: {recommendedDrape.name}
              </Alert>
            ) : null}
          </Stack>
        )
      case 2:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Review suggested items
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Confirm the auto-suggested constituents before making adjustments.
              </Typography>
            </Box>
            {items.length === 0 ? (
              <Alert severity="warning">
                No items were suggested for this selection. Proceed to the next step to add items manually.
              </Alert>
            ) : (
              <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell width="120">Quantity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.key}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography>{item.name}</Typography>
                            <Chip size="small" label={changeTypeChipConfig[item.changeType].label} color={changeTypeChipConfig[item.changeType].color} />
                          </Stack>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </Stack>
        )
      case 3:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Customize items and quantities
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Adjust suggested items, search the catalog, or add custom lines. Changes are tracked for transparency.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch">
              <Box flex={1}>
                {items.length === 0 ? (
                  <Alert severity="warning">
                    There are no items in this order yet. Use the search or custom item entry to add constituents.
                  </Alert>
                ) : (
                  <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell width="140">Quantity</TableCell>
                          <TableCell>Notes</TableCell>
                          <TableCell align="right" width="60">&nbsp;</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((item) => (
                          <TableRow key={item.key}>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography fontWeight={500}>{item.name}</Typography>
                                <Chip size="small" label={changeTypeChipConfig[item.changeType].label} color={changeTypeChipConfig[item.changeType].color} variant={item.changeType === 'default' ? 'outlined' : 'filled'} />
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                size="small"
                                value={item.quantity}
                                onChange={(event) => {
                                  const parsed = parseInt(event.target.value, 10)
                                  const quantity = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed
                                  updateItem(item.key, { quantity })
                                }}
                                inputProps={{ min: 1 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                placeholder="Notes"
                                value={item.notes ?? ''}
                                onChange={(event) => {
                                  updateItem(item.key, { notes: event.target.value })
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton aria-label="Remove item" onClick={() => handleRemoveItem(item.key)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                )}
                {removedItems.length > 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    {removedItems.length} item{removedItems.length > 1 ? 's' : ''} removed from this order will not be included in the submission.
                  </Alert>
                ) : null}
              </Box>
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
              <Box flex={{ xs: 1, md: 0.9 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Search catalog
                    </Typography>
                    <TextField
                      value={itemSearchQuery}
                      onChange={(event) => setItemSearchQuery(event.target.value)}
                      placeholder="Search by name or description"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          isSearchingItems ? <CircularProgress size={20} /> : undefined
                        ),
                      }}
                    />
                    <Paper variant="outlined" sx={{ mt: 1, maxHeight: 240, overflowY: 'auto' }}>
                      {itemSearchResults.length === 0 ? (
                        <Box sx={{ py: 3, px: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {itemSearchQuery.trim() ? 'No catalog results match your search.' : 'Start typing to search for catalog items.'}
                          </Typography>
                        </Box>
                      ) : (
                        <List dense>
                          {itemSearchResults.map((entry) => (
                            <ListItem
                              key={entry.id}
                              secondaryAction={
                                <Button size="small" onClick={() => handleAddItemFromCatalog(entry)} startIcon={<AddIcon fontSize="small" />}>
                                  Add
                                </Button>
                              }
                            >
                              <ListItemText
                                primary={entry.name}
                                secondary={entry.description ? `${entry.description}${entry.unit ? ` · ${entry.unit}` : ''}` : entry.unit ? `Unit: ${entry.unit}` : undefined}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Paper>
                  </Box>
                  <Divider flexItem>
                    <Typography variant="caption" color="text.secondary">
                      or add a custom item
                    </Typography>
                  </Divider>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'flex-end' }}>
                    <TextField
                      label="Item name"
                      value={customItemName}
                      onChange={(event) => setCustomItemName(event.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Quantity"
                      type="number"
                      value={customItemQuantity}
                      onChange={(event) => {
                        const parsed = parseInt(event.target.value, 10)
                        setCustomItemQuantity(Number.isNaN(parsed) || parsed < 1 ? 1 : parsed)
                      }}
                      sx={{ width: { xs: '100%', sm: 140 } }}
                      inputProps={{ min: 1 }}
                    />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddCustomItem} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                      Add custom
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Customization notes
              </Typography>
              <TextField
                multiline
                minRows={3}
                placeholder="Add guidance or context for fulfillment (optional)"
                value={customizationNotes}
                onChange={(event) => setCustomizationNotes(event.target.value)}
                fullWidth
              />
            </Box>
          </Stack>
        )
      case 4:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Order summary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review the final order configuration before submission.
              </Typography>
            </Box>
            {submitError ? <Alert severity="error">{submitError}</Alert> : null}
            {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Order details
              </Typography>
              <Stack spacing={1}>
                <Typography>
                  <strong>Drape:</strong> {drapeSelection.name || 'Not specified'}
                </Typography>
                <Typography>
                  <strong>Surgery:</strong> {surgerySelection.name || 'Not specified'}
                </Typography>
                {submitterName ? (
                  <Typography>
                    <strong>Prepared by:</strong> {submitterName}
                  </Typography>
                ) : null}
              </Stack>
            </Paper>
            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell width="120">Quantity</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell width="140">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.key}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.notes?.trim() || '—'}</TableCell>
                      <TableCell>
                        <Chip size="small" label={changeTypeChipConfig[item.changeType].label} color={changeTypeChipConfig[item.changeType].color} variant={item.changeType === 'default' ? 'outlined' : 'filled'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
            {removedItems.length > 0 ? (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Removed items
                </Typography>
                <List dense>
                  {removedItems.map((item) => (
                    <ListItem key={item.key}>
                      <ListItemText
                        primary={item.name}
                        secondary={`Previously ${item.defaultQuantity ?? item.quantity} unit${(item.defaultQuantity ?? item.quantity) > 1 ? 's' : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ) : null}
            {customizationNotes.trim() ? (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Notes for fulfillment
                </Typography>
                <Typography color="text.secondary">{customizationNotes.trim()}</Typography>
              </Paper>
            ) : null}
          </Stack>
        )
      default:
        return null
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Hospital Order Wizard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Follow the guided steps to build a complete, submission-ready order with clear visibility into suggested and customized items.
          </Typography>
        </Box>
        <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, md: 4 } }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: { xs: 3, md: 4 } }}>
            {steps.map((step) => (
              <Step key={step.title}>
                <StepLabel>
                  <Typography variant="body1" fontWeight={500}>
                    {step.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <Divider sx={{ mb: { xs: 3, md: 4 } }} />
          {renderStepContent()}
          <Divider sx={{ mt: { xs: 3, md: 4 }, mb: { xs: 2, md: 3 } }} />
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0 || isSubmitting}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canProceed(activeStep) || isSubmitting}
            >
              {activeStep === steps.length - 1 ? (isSubmitting ? 'Submitting…' : 'Submit order') : 'Next'}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
