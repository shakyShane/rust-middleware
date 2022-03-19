use actix_web::dev::{RequestHead, ResponseHead};
use bytes::Bytes;

///
/// Response Modifications
///
/// Allow easy string-manipulation of text-based HTTP
/// Response bodies
///
pub trait RespMod {
    ///
    /// Name to be used in debug/display situations
    ///
    fn name(&self) -> String;
    ///
    /// Gives access to the ENTIRE buffered response body
    ///
    fn process_str(&self, resp: String) -> String {
        resp
    }
    ///
    /// To prevent buffering/modifications on all requests,
    /// you need to implement this guard
    ///
    fn guard(&self, req_head: &RequestHead, res_head: &ResponseHead) -> bool;
}

pub trait RespModDataTrait {
    fn get_transform_indexes(&self, req_head: &RequestHead, res_head: &ResponseHead) -> Vec<usize>;
    fn process_str(&self, input: String, indexes: &[usize]) -> String;
}

pub struct RespModData {
    pub items: Vec<Box<dyn RespMod>>,
}

impl RespModDataTrait for RespModData {
    fn get_transform_indexes(&self, req_head: &RequestHead, res_head: &ResponseHead) -> Vec<usize> {
        self.items
            .iter()
            .enumerate()
            .filter_map(|(index, item)| {
                log::debug!("checking [{}] {}", index, item.name());
                if item.guard(req_head, res_head) {
                    Some(index)
                } else {
                    None
                }
            })
            .collect()
    }

    fn process_str(&self, input: String, indexes: &[usize]) -> String {
        indexes.iter().fold(input, |acc, index| {
            let item = self.items.get(*index).expect("guarded");
            log::debug!("processing [{}] {}", index, item.name());
            item.process_str(acc)
        })
    }
}

///
/// Process the entire buffered body in 1 go, this avoids trying to match over
/// chunked responses etc
///
pub fn process_buffered_body(
    bytes: Bytes,
    uri: String,
    transforms: Option<&RespModData>,
    indexes: &[usize],
) -> Result<Bytes, actix_web::Error> {
    let to_process = std::str::from_utf8(&bytes);
    match to_process {
        Ok(str) => {
            let string = String::from(str);
            if !indexes.is_empty() {
                log::debug!("processing indexes {:?} for `{}`", indexes, uri);
                let next = transforms
                    .map(|trans| trans.process_str(string.clone(), indexes))
                    .unwrap_or_else(String::new);
                return Ok(Bytes::from(next));
            }
            log::debug!("NOT processing indexes {:?} for `{}`", indexes, uri);
            Ok(Bytes::from(string))
        }
        Err(e) => {
            eprintln!("error converting bytes {:?}", e);
            Ok(bytes)
        }
    }
}
