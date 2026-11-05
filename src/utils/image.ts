import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

/** Shrinks a picked photo to 256 px / JPEG 60 % (~20 KB) and returns base64. Works with old + new manipulator APIs. */
async function shrinkToBase64(uri: string): Promise<string> {
  const IM = ImageManipulator as any;
  if (IM.ImageManipulator?.manipulate) {
    const ctx = IM.ImageManipulator.manipulate(uri);
    ctx.resize({ width: 256 });
    const rendered = await ctx.renderAsync();
    const saved = await rendered.saveAsync({ format: 'jpeg', compress: 0.6, base64: true });
    return saved.base64 as string;
  }
  const res = await IM.manipulateAsync(uri, [{ resize: { width: 256 } }], {
    compress: 0.6, format: 'jpeg', base64: true,
  });
  return res.base64 as string;
}

/**
 * Opens the gallery, lets the user crop a square, and returns a data-URI
 * ready to be stored in Firestore (null if the user cancelled).
 */
export async function pickProfilePhoto(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('Permission to access your photos was denied');

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (res.canceled || !res.assets?.length) return null;
  const b64 = await shrinkToBase64(res.assets[0].uri);
  return `data:image/jpeg;base64,${b64}`;
}
