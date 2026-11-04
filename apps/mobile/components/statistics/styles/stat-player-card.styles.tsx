import { StyleSheet } from 'react-native'
import { Colors } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    paddingVertical: 14,      
    paddingHorizontal: 16,    
    marginBottom: 0,          
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,                  
  },
  rank: {
    width: 24,
    fontSize: 18,            
    fontWeight: '700',       
    textAlign: 'center',
    
  },
  mainInfo: {
    flex: 1,
    minWidth: 0,
    
  },
  name: {
    fontSize: 20,             
    fontWeight: '700',
    marginBottom: 2,
  },
  record: {
    fontSize: 13,             
    fontWeight: '500',       
    letterSpacing: 0.2,
  },
  featured: {
    alignItems: 'center',
  },
  featuredValue: {
    color: Colors.light.secondary,
    fontWeight: '800',        
    fontSize: 32,            
    lineHeight: 32,           
  },
  featuredLabel: {
    marginTop: 2,
    fontSize: 11,             
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
    marginVertical: 10,       
  },
  metrics: {
    paddingTop: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,                   
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,             
    lineHeight: 22,           
    fontWeight: '700',       
  },
  metricIcon: {
    marginBottom: 4,
  },
})
