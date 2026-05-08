import { StyleSheet } from 'react-native'

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
  avatar: {
    width: 48,               
    height: 48,              
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontSize: 18,            
    letterSpacing: 0.4,
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
    alignItems: 'flex-end',
  },
  featuredValue: {
    color: '#f97316',
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
  metricLabel: {
    marginTop: 2,
    fontSize: 10,            
    fontWeight: '600',        
    letterSpacing: 0.4,
  },
})