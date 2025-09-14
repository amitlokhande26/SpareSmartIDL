import { supabase } from './supabase.js'

// Lines table operations
export const getLines = async () => {
  const { data, error } = await supabase
    .from('lines')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data || []
}

export const addLine = async (lineData) => {
  const { data, error } = await supabase
    .from('lines')
    .insert([lineData])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateLine = async (lineId, updates) => {
  const { data, error } = await supabase
    .from('lines')
    .update(updates)
    .eq('id', lineId)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteLine = async (lineId) => {
  const { error } = await supabase
    .from('lines')
    .delete()
    .eq('id', lineId)
  
  if (error) throw error
}

// Machines table operations
export const getMachines = async (lineId) => {
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .eq('line_id', lineId)
    .order('name')
  
  if (error) throw error
  return data || []
}

export const addMachine = async (machineData) => {
  const { data, error } = await supabase
    .from('machines')
    .insert([machineData])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateMachine = async (machineId, updates) => {
  const { data, error } = await supabase
    .from('machines')
    .update(updates)
    .eq('id', machineId)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteMachine = async (machineId) => {
  const { error } = await supabase
    .from('machines')
    .delete()
    .eq('id', machineId)
  
  if (error) throw error
}

// Parts table operations
export const getParts = async (machineId) => {
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .eq('machine_id', machineId)
    .order('part_number')
  
  if (error) throw error
  return data || []
}

export const addPart = async (partData) => {
  const { data, error } = await supabase
    .from('parts')
    .insert([partData])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updatePart = async (partId, updates) => {
  const { data, error } = await supabase
    .from('parts')
    .update(updates)
    .eq('id', partId)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deletePart = async (partId) => {
  const { error } = await supabase
    .from('parts')
    .delete()
    .eq('id', partId)
  
  if (error) throw error
}

// Checkweighers table operations
export const getCheckweighers = async (lineId) => {
  const { data, error } = await supabase
    .from('checkweighers')
    .select('*')
    .eq('line_id', lineId)
    .order('name')
  
  if (error) throw error
  return data || []
}

export const addCheckweigher = async (checkweigherData) => {
  const { data, error } = await supabase
    .from('checkweighers')
    .insert([checkweigherData])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateCheckweigher = async (checkweigherId, updates) => {
  const { data, error } = await supabase
    .from('checkweighers')
    .update(updates)
    .eq('id', checkweigherId)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteCheckweigher = async (checkweigherId) => {
  const { error } = await supabase
    .from('checkweighers')
    .delete()
    .eq('id', checkweigherId)
  
  if (error) throw error
}

// Global search function
export const globalSearch = async (query) => {
  if (!query.trim()) return { lines: [], machines: [], parts: [], checkweighers: [] }
  
  const searchTerm = `%${query.toLowerCase()}%`
  
  const [linesResult, machinesResult, partsResult, checkweighersResult] = await Promise.all([
    supabase.from('lines').select('*').ilike('name', searchTerm),
    supabase.from('machines').select('*').ilike('name', searchTerm),
    supabase.from('parts').select('*').or(`part_number.ilike.${searchTerm},description.ilike.${searchTerm}`),
    supabase.from('checkweighers').select('*').ilike('name', searchTerm)
  ])
  
  return {
    lines: linesResult.data || [],
    machines: machinesResult.data || [],
    parts: partsResult.data || [],
    checkweighers: checkweighersResult.data || []
  }
}
