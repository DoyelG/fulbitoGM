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

export const locationStyles = StyleSheet.create({
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerBtn: {
    flex: 1,
  },
  addBtn: {
    width: 28,
    height: 39,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 20,
    color: '#fff',
    lineHeight: 22,
  },
  pickerScroll: {
    maxHeight: 300,
  },
  optionRow: {
    gap: 16,
  },
  optionTouch: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    padding: 24,
  },
  formBody: {
    gap: 4,
    paddingHorizontal: 14,
  },
  deleteBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 22,
  },
  deleteText: {
    fontSize: 16,
    lineHeight: 22,
  },
  deleteBtn: {
    alignSelf: 'flex-end',
  },
  deleteBtnText: {
    fontWeight: '700',
    fontSize: 17,
  },
})
