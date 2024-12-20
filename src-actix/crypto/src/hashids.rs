use crate::salt::get_salt;
use hash_ids::HashIds;
use log::debug;

/// Decodes a given hash string into a vector of `u64` integers.
///
/// # Arguments
///
/// * `hash` - A string slice that holds the hash to be decoded.
///
/// # Returns
///
/// A vector of `u64` integers that were encoded in the given hash string.
pub fn decode(hash: impl AsRef<str>) -> Result<Vec<u64>, Box<dyn std::error::Error>> {
    let hash = hash.as_ref();
    let hash_ids = hashids();
    let decode = hash_ids.decode(hash)?;
    debug!("Decoding: {} -> {:?}", hash, decode);
    Ok(decode)
}

/// Encodes a slice of `u64` integers into a hash string.
///
/// # Arguments
///
/// * `data` - A slice of `u64` integers to be encoded.
///
/// # Returns
///
/// A string that represents the encoded hash of the input data.
pub fn encode(data: &[u64]) -> String {
    let hash_ids = hashids();
    let encode = hash_ids.encode(data);
    debug!("Encoding: {:?} -> {}", data, encode);
    encode
}

/// Decodes a hash string into a single `u64` value.
///
/// # Arguments
///
/// * `hash` - A string reference that contains the hash to be decoded.
///
/// # Returns
///
/// * On success, returns a single `u64` value that was encoded in the hash.
/// * On failure, returns an error if the hash does not decode to exactly one `u64` value,
///   or if an error occurs during decoding.
pub fn decode_single(hash: impl AsRef<str>) -> Result<u64, Box<dyn std::error::Error>> {
    let hash = hash.as_ref(); // Extracts the underlying string reference from the wrapper.
    let decode = decode(hash)?; // Attempts to decode the hash into a vector of `u64` integers.

    // Check if the decoded result contains exactly one value.
    if decode.len() != 1 {
        return Err(format!("Invalid hash: {}", hash).into()); // Returns an error if not.
    }

    // Successfully return the single decoded value.
    Ok(decode[0])
}

/// Encodes a single `u64` value into a hash string.
///
/// # Arguments
///
/// * `data` - A single `u64` value to be encoded into a hash.
///
/// # Returns
///
/// * A string that represents the encoded hash of the input value.
pub fn encode_single(data: u64) -> String {
    encode(&[data]) // Calls the `encode` function with the input value wrapped in a slice.
}

fn hashids() -> HashIds {
    HashIds::builder()
        .with_salt(get_salt().as_str())
        .with_min_length(16)
        .finish()
}
