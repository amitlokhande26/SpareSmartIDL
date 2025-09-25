import { useState, useEffect } from 'react'
import { InventoryService } from '../services/inventoryService.js'

export const useInventory = () => {
  const [parts, setParts] = useState([])
  const [machines, setMachines] = useState([])
  const [lines, setLines] = useState([])
  const [checkweighers, setCheckweighers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load all data
  const loadAllData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [partsData, machinesData, linesData, checkweighersData] = await Promise.all([
        InventoryService.getParts(),
        InventoryService.getMachines(),
        InventoryService.getLines(),
        InventoryService.getCheckweighers()
      ])
      
      setParts(partsData)
      setMachines(machinesData)
      setLines(linesData)
      setCheckweighers(checkweighersData)
    } catch (err) {
      setError(err.message)
      console.error('Error loading inventory data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load specific data
  const loadParts = async () => {
    try {
      const data = await InventoryService.getParts()
      setParts(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const loadMachines = async () => {
    try {
      const data = await InventoryService.getMachines()
      setMachines(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const loadLines = async () => {
    try {
      const data = await InventoryService.getLines()
      setLines(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const loadCheckweighers = async () => {
    try {
      const data = await InventoryService.getCheckweighers()
      setCheckweighers(data)
    } catch (err) {
      setError(err.message)
    }
  }

  // CRUD operations for parts
  const createPart = async (partData) => {
    try {
      const newPart = await InventoryService.createPart(partData)
      setParts(prev => [newPart, ...prev])
      return newPart
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updatePart = async (id, partData) => {
    try {
      const updatedPart = await InventoryService.updatePart(id, partData)
      setParts(prev => prev.map(part => part.id === id ? updatedPart : part))
      return updatedPart
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deletePart = async (id) => {
    try {
      await InventoryService.deletePart(id)
      setParts(prev => prev.filter(part => part.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // CRUD operations for machines
  const createMachine = async (machineData) => {
    try {
      const newMachine = await InventoryService.createMachine(machineData)
      setMachines(prev => [newMachine, ...prev])
      return newMachine
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateMachine = async (id, machineData) => {
    try {
      const updatedMachine = await InventoryService.updateMachine(id, machineData)
      setMachines(prev => prev.map(machine => machine.id === id ? updatedMachine : machine))
      return updatedMachine
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteMachine = async (id) => {
    try {
      await InventoryService.deleteMachine(id)
      setMachines(prev => prev.filter(machine => machine.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // CRUD operations for lines
  const createLine = async (lineData) => {
    try {
      const newLine = await InventoryService.createLine(lineData)
      setLines(prev => [newLine, ...prev])
      return newLine
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateLine = async (id, lineData) => {
    try {
      const updatedLine = await InventoryService.updateLine(id, lineData)
      setLines(prev => prev.map(line => line.id === id ? updatedLine : line))
      return updatedLine
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteLine = async (id) => {
    try {
      await InventoryService.deleteLine(id)
      setLines(prev => prev.filter(line => line.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // CRUD operations for checkweighers
  const createCheckweigher = async (checkweigherData) => {
    try {
      const newCheckweigher = await InventoryService.createCheckweigher(checkweigherData)
      setCheckweighers(prev => [newCheckweigher, ...prev])
      return newCheckweigher
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateCheckweigher = async (id, checkweigherData) => {
    try {
      const updatedCheckweigher = await InventoryService.updateCheckweigher(id, checkweigherData)
      setCheckweighers(prev => prev.map(checkweigher => checkweigher.id === id ? updatedCheckweigher : checkweigher))
      return updatedCheckweigher
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteCheckweigher = async (id) => {
    try {
      await InventoryService.deleteCheckweigher(id)
      setCheckweighers(prev => prev.filter(checkweigher => checkweigher.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Global search
  const globalSearch = async (query) => {
    try {
      const results = await InventoryService.globalSearch(query)
      return results
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Load data on mount
  useEffect(() => {
    loadAllData()
  }, [])

  return {
    // Data
    parts,
    machines,
    lines,
    checkweighers,
    loading,
    error,
    
    // Load functions
    loadAllData,
    loadParts,
    loadMachines,
    loadLines,
    loadCheckweighers,
    
    // Parts CRUD
    createPart,
    updatePart,
    deletePart,
    
    // Machines CRUD
    createMachine,
    updateMachine,
    deleteMachine,
    
    // Lines CRUD
    createLine,
    updateLine,
    deleteLine,
    
    // Checkweighers CRUD
    createCheckweigher,
    updateCheckweigher,
    deleteCheckweigher,
    
    // Search
    globalSearch
  }
}
