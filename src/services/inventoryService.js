import { supabase } from '../lib/supabase.js'

// Database service for inventory management
export class InventoryService {
  
  // Parts management
  static async getParts() {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  }

  static async createPart(partData) {
    const { data, error } = await supabase
      .from('parts')
      .insert([{
        name: partData.name,
        part_number: partData.part_number || '',
        machine_id: partData.machine_id,
        description: partData.description || '',
        stock_quantity: partData.stock_quantity || 0,
        min_stock_level: partData.min_stock_level || 0,
        location: partData.location || '',
        cost: partData.cost || null,
        last_checked: partData.last_checked || null,
        next_due: partData.next_due || null,
        others: partData.others || ''
      }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async updatePart(id, partData) {
    const { data, error } = await supabase
      .from('parts')
      .update(partData)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async deletePart(id) {
    const { error } = await supabase
      .from('parts')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Machines management
  static async getMachines() {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  }

  static async createMachine(machineData) {
    const { data, error } = await supabase
      .from('machines')
      .insert([{
        name: machineData.name,
        line_id: machineData.line_id,
        description: machineData.description || '',
        status: machineData.status || 'active',
        location: machineData.location || ''
      }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async updateMachine(id, machineData) {
    const { data, error } = await supabase
      .from('machines')
      .update(machineData)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async deleteMachine(id) {
    const { error } = await supabase
      .from('machines')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Lines management
  static async getLines() {
    const { data, error } = await supabase
      .from('lines')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  }

  static async createLine(lineData) {
    const { data, error } = await supabase
      .from('lines')
      .insert([{
        name: lineData.name,
        description: lineData.description || '',
        location: lineData.location || '',
        capacity: lineData.capacity || null,
        efficiency: lineData.efficiency || null
      }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async updateLine(id, lineData) {
    const { data, error } = await supabase
      .from('lines')
      .update(lineData)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async deleteLine(id) {
    const { error } = await supabase
      .from('lines')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Checkweighers management
  static async getCheckweighers() {
    const { data, error } = await supabase
      .from('checkweighers')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  }

  static async createCheckweigher(checkweigherData) {
    const { data, error } = await supabase
      .from('checkweighers')
      .insert([{
        name: checkweigherData.name,
        line_id: checkweigherData.line_id,
        last_calibrated: checkweigherData.last_calibrated || null,
        next_due: checkweigherData.next_due || null
      }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async updateCheckweigher(id, checkweigherData) {
    const { data, error } = await supabase
      .from('checkweighers')
      .update(checkweigherData)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }

  static async deleteCheckweigher(id) {
    const { error } = await supabase
      .from('checkweighers')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Global search across all tables
  static async globalSearch(query) {
    if (!query.trim()) return []

    const searchTerm = `%${query}%`
    
    // Search across all tables
    const [partsResult, machinesResult, linesResult, checkweighersResult] = await Promise.all([
      supabase.from('parts').select('*').or(`name.ilike.${searchTerm},part_number.ilike.${searchTerm},description.ilike.${searchTerm}`),
      supabase.from('machines').select('*').or(`name.ilike.${searchTerm},model.ilike.${searchTerm},description.ilike.${searchTerm}`),
      supabase.from('lines').select('*').or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`),
      supabase.from('checkweighers').select('*').or(`name.ilike.${searchTerm},model.ilike.${searchTerm},description.ilike.${searchTerm}`)
    ])

    return {
      parts: partsResult.data || [],
      machines: machinesResult.data || [],
      lines: linesResult.data || [],
      checkweighers: checkweighersResult.data || []
    }
  }
}
