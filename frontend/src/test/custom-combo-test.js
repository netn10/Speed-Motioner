// Test file for custom combo functionality
import { useTrainingStore } from '../stores/trainingStore'

// Mock test for custom combo functionality
const testCustomComboFunctionality = () => {
  console.log('🧪 Testing Custom Combo Functionality...')
  
  const { 
    saveCustomCombo, 
    getAllCustomCombos, 
    updateCustomCombo, 
    deleteCustomCombo,
    clearCustomCombos 
  } = useTrainingStore.getState()
  
  // Test 1: Save a custom combo
  console.log('📝 Test 1: Saving a custom combo')
  const testCombo = {
    name: 'Test QCF Combo',
    description: 'Quarter Circle Forward + Light Punch',
    inputs: ['down', 'right', 'lp']
  }
  
  const savedCombo = saveCustomCombo(testCombo)
  console.log('✅ Saved combo:', savedCombo)
  
  // Test 2: Get all combos
  console.log('📋 Test 2: Getting all combos')
  const allCombos = getAllCustomCombos()
  console.log('✅ All combos:', allCombos)
  
  // Test 3: Update a combo
  console.log('✏️ Test 3: Updating a combo')
  const updatedCombo = updateCustomCombo(savedCombo.id, {
    name: 'Updated QCF Combo',
    description: 'Updated description'
  })
  console.log('✅ Updated combo:', updatedCombo)
  
  // Test 4: Get updated combos
  const updatedCombos = getAllCustomCombos()
  console.log('✅ Updated combos list:', updatedCombos)
  
  // Test 5: Delete a combo
  console.log('🗑️ Test 5: Deleting a combo')
  deleteCustomCombo(savedCombo.id)
  const combosAfterDelete = getAllCustomCombos()
  console.log('✅ Combos after delete:', combosAfterDelete)
  
  // Test 6: Clear all combos
  console.log('🧹 Test 6: Clearing all combos')
  clearCustomCombos()
  const combosAfterClear = getAllCustomCombos()
  console.log('✅ Combos after clear:', combosAfterClear)
  
  console.log('🎉 All custom combo tests completed!')
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testCustomComboFunctionality = testCustomComboFunctionality
}

export default testCustomComboFunctionality
