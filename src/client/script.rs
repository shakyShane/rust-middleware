use crate::resp_mod::RespMod;
use actix_web::dev::{RequestHead, ResponseHead};
use actix_web::http::header::{HeaderMap, ACCEPT, CONTENT_TYPE};

#[derive(Debug, Clone)]
pub struct Script;

impl RespMod for Script {
    fn name(&self) -> String {
        String::from("bs3 script tag")
    }
    fn process_str(&self, str: String) -> String {
        let injected = r#"
<!-- injected by Browsersync -->
<script src="/__bs3/client-js/client.js"></script>
<!-- end:injected by Browsersync -->
</body>
        "#;
        str.replace("</body>", injected)
    }
    fn guard(&self, req_head: &RequestHead, res_head: &ResponseHead) -> bool {
        log::trace!("Script::RespMod::guard {} ", req_head.uri);
        is_accept_html(&req_head.headers) && is_content_type_html(&res_head.headers)
    }
}

fn is_accept_html(headers: &HeaderMap) -> bool {
    headers
        .get(ACCEPT)
        .and_then(|hv| hv.to_str().ok())
        .filter(|str| str.contains("text/html") || *str == "*/*")
        .is_some()
}

fn is_content_type_html(headers: &HeaderMap) -> bool {
    headers
        .get(CONTENT_TYPE)
        .and_then(|hv| hv.to_str().ok())
        .filter(|str| str.contains("text/html"))
        .is_some()
}
