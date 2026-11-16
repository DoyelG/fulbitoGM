import { StyleSheet } from 'react-native'

import { DrawerColors, PrimaryColors } from '@/constants/theme'

export const styles = StyleSheet.create({
  root: {
    zIndex: 100,
    elevation: 100,
  },
  backdrop: {
    backgroundColor: DrawerColors.backdrop,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DrawerColors.sheet,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    shadowColor: DrawerColors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: DrawerColors.handle,
    alignSelf: 'center',
    marginBottom: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: DrawerColors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: DrawerColors.muted,
  },
  divider: {
    height: 1,
    backgroundColor: DrawerColors.divider,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 14,
  },
  itemPressed: {
    backgroundColor: DrawerColors.itemPressed,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: DrawerColors.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBadge: {
    marginLeft: 'auto',
  },
  dangerIconWrapper: {
    backgroundColor: DrawerColors.dangerBg,
  },
  dangerLabel: {
    color: DrawerColors.danger,
  },
  itemText: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: DrawerColors.text,
  },
  itemSubtitle: {
    fontSize: 12,
    color: DrawerColors.muted,
    marginTop: 2,
  },
  loginSection: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 6,
  },
  loginTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: DrawerColors.text,
  },
  loginSubtitle: {
    fontSize: 13,
    color: DrawerColors.muted,
    marginBottom: 12,
  },
  loginBtnHitArea: {
    alignSelf: 'flex-start',
  },
  loginBtnRow: {
    flexDirection: 'row',
  },
  loginBtnLeft: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 40,
    borderTopColor: 'transparent',
    borderRightWidth: 12,
    borderRightColor: PrimaryColors.border,
  },
  loginBtnMid: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: PrimaryColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnRight: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderBottomWidth: 40,
    borderBottomColor: 'transparent',
    borderLeftWidth: 12,
    borderLeftColor: PrimaryColors.border,
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
    color: DrawerColors.onPrimary,
    letterSpacing: 1.5,
  },
  optionsContainer: {
    flex: 1,
  },
  appVersionInfo: {
    paddingHorizontal: 24,
    gap: 6,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  appVersionText: {
    fontSize: 10,
    color: DrawerColors.muted,
  },
})
