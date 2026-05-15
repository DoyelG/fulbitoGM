import { StyleSheet } from 'react-native'

export const sheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 30,
    maxHeight: '65%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  close: {
    fontSize: 15,
    fontWeight: '600',
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
  },
})

export const fieldStyles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputBtnText: {
    fontSize: 14,
  },
})
