use crate::Options;
use actix_files::Files;
use std::ops::Deref;

use crate::client::html::BASE_HTML;
use actix_web::http::{Method, Uri};
use actix_web::{http, web, HttpResponse};
use serde::Deserialize;
use tokio::sync::Mutex;
use uuid::Uuid;

#[derive(Debug, Clone, Default)]
pub struct Runtime {
    debug: bool,
}

fn redirect_to(location: &str) -> HttpResponse {
    HttpResponse::Found()
        .append_header((http::header::LOCATION, location))
        .finish()
}

impl Runtime {
    pub fn with_debug() -> Self {
        Self { debug: true }
    }
    pub fn configure(&self, opts: &Options, cfg: &mut web::ServiceConfig) {
        dbg!(opts.cwd.join("app-js"));
        cfg.service(Files::new("/__bs3/app-js", opts.cwd.join("bs3/app-js")));

        async fn handle_get_root() -> actix_web::Result<HttpResponse> {
            Ok(HttpResponse::Ok().content_type("text/html").body(BASE_HTML))
        }

        async fn handle_get_1(path: web::Path<String>) -> actix_web::Result<HttpResponse> {
            Ok(HttpResponse::Ok().content_type("text/html").body(BASE_HTML))
        }

        async fn handle_post_1(
            params: web::Form<TempRoute>,
            sender: web::Data<Mutex<TempData>>,
        ) -> actix_web::Result<HttpResponse> {
            let mut temp_data = sender.lock().await;
            temp_data.routes.push(params.clone());
            dbg!(&temp_data);
            return Ok(redirect_to(
                format!("/__bs3/api/routes/{id}", id = params.id).as_str(),
            ));
            let as_json = serde_json::to_string_pretty(&(temp_data.deref()))?;
            Ok(HttpResponse::TemporaryRedirect().content_type("text/html").body(format!(
                r##"
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
             <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
             <meta http-equiv="X-UA-Compatible" content="ie=edge">
             <title>Route created for</title>
</head>
<body>
    <p>Link: <a href="{path}">{path}</a></p>
    <div>
    <pre><code>{body}</code></pre>
    </div>
    <div>
    <pre><code>{json}</code></pre>
    </div>
</body>
</html>
"##,
                body = html_escape::encode_text(&params.body),
                path = html_escape::encode_text(params.pathname.path()),
                json = html_escape::encode_text(&as_json)
            )))
        }

        cfg.service(
            web::scope("/__bs3/api")
                // .app_data(web::Data::new())
                // .service(web::resource("/").route(web::get().to(index)))
                .service(web::resource("/routes/{id}").route(web::get().to(handle_get_1)))
                .service(web::resource("/routes").route(web::get().to(handle_get_root)))
                .service(web::resource("/routes").route(web::post().to(handle_post_1))),
        );
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct TempRoute {
    pub body: String,
    /// the method that this temp route should respond to
    #[serde(
        serialize_with = "serde_str::serialize",
        deserialize_with = "method_from_str",
        default
    )]
    method: Method,
    #[serde(with = "serde_str")]
    pathname: Uri,
    #[serde(default = "Uuid::new_v4", with = "serde_str")]
    id: Uuid,
}

#[derive(Default, Debug, serde::Serialize)]
pub struct TempData {
    routes: Vec<TempRoute>,
}

impl TempData {
    pub(crate) fn route_for(&self, p0: &Uri) -> Option<&TempRoute> {
        self.routes.iter().find(|r| r.pathname == *p0)
    }
}

pub fn method_from_str<'de, D>(deserializer: D) -> Result<Method, D::Error>
where
    D: serde::Deserializer<'de>,
{
    use serde::de::Error;

    String::deserialize(deserializer)
        .and_then(|string| {
            Method::from_bytes(string.as_bytes()).map_err(|err| Error::custom(err.to_string()))
        })
        .and_then(|method| match method {
            Method::GET | Method::POST => Ok(method),
            _ => Err(Error::custom("Only GET+POST supported")),
        })
}

#[cfg(test)]
mod test {
    use super::*;
    #[test]
    fn test_deserialize() -> anyhow::Result<()> {
        let input = serde_json::json!({
            "body": "hello world!",
            "method": "GET",
            "pathname": "~~www"
        });
        let td: TempRoute = serde_json::from_value(input).expect("GET");
        assert_eq!(td.method, Method::GET);
        Ok(())
    }
    #[test]
    fn test_deserialize_default() -> anyhow::Result<()> {
        let input = serde_json::json!({
            "body": "hello world!",
            "pathname": "~~www"
        });
        let td: TempRoute = serde_json::from_value(input).expect("GET");
        assert_eq!(td.method, Method::GET);
        Ok(())
    }
}
