use crate::multi_service::MultiServiceImpl;
use crate::Options;
use actix_web::dev::ServiceRequest;

use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Default)]
pub struct ServeStatic {
    pub mount_path: String,
    pub serve_from: PathBuf,
    pub index_file: String,
}

impl ServeStatic {
    pub fn from_dir(dir: impl Into<PathBuf>, opts: &Options) -> Self {
        todo!("from_dir solve '.' use case");
        Self {
            mount_path: "/".into(),
            serve_from: opts.cwd.join(dir.into()),
            index_file: "index.html".into(),
        }
    }
    pub fn from_dir_routed(dir: impl Into<PathBuf>, mount_path: &str, opts: &Options) -> Self {
        todo!("from_dir_routed solve '.' use case");
        Self {
            mount_path: mount_path.into(),
            serve_from: opts.cwd.join(dir.into()),
            index_file: "index.html".into(),
        }
    }
}

impl MultiServiceImpl for ServeStatic {
    fn should_serve(&self, req: &ServiceRequest) -> bool {
        req.uri()
            .path_and_query()
            .map(|pq| {
                // let matches = pq.path().starts_with(&ss.mount_path);
                let path = pq.path();
                let trimmed = path.trim_start_matches(&self.mount_path);
                let exists = file_path(trimmed, &self.serve_from);
                // println!("trimmed={}", trimmed);
                println!(
                    "mount_path=[{}], dir=[{}], exists=[{:?}]",
                    self.mount_path,
                    self.serve_from.display(),
                    exists
                );
                exists.is_some()
            })
            .unwrap_or(false)
    }
}

fn file_path(path: &str, dir: &Path) -> Option<PathBuf> {
    if let Ok(real_path) = path.parse::<crate::PathBufWrap>() {
        if let Ok(pb) = dir.join(&real_path).canonicalize() {
            return Some(pb);
        }
    }
    None
}
