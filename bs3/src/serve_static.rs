use crate::multi_service::MultiServiceImpl;
use crate::{Options, ServeStaticConfig};
use actix_web::dev::ServiceRequest;
use std::ffi::OsStr;
use std::ops::Deref;

use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Default)]
pub struct ServeStatic {
    pub mount_path: String,
    pub serve_from: ServeFrom,
    pub index_file: String,
}

///
/// This is here to encapsulate any logic around resolving a 'serve' directory.
///
/// For example, "." should just resolve to the current working directory, and not
/// cwd + '/.'
///
/// ## Current Dir
/// ```rust
/// # use std::path::PathBuf;
/// # use bs3_lib::serve_static::ServeFrom;
/// let cwd = PathBuf::from("/users/shakyshane");
/// let dir = PathBuf::from(".");
/// let serve_from = ServeFrom::new(&cwd, &dir);
/// assert_eq!(*serve_from, cwd);
/// ```
///
/// ## Current Dir + relative path
/// ```rust
/// # use std::path::PathBuf;
/// # use bs3_lib::serve_static::ServeFrom;
/// let cwd = PathBuf::from("/users/shakyshane");
/// let dir = PathBuf::from("fixtures");
/// let serve_from = ServeFrom::new(&cwd, &dir);
/// assert_eq!(*serve_from, cwd.join(dir));
/// ```
///
/// ## Current Dir + absolute path
/// ```rust
/// # use std::path::PathBuf;
/// # use bs3_lib::serve_static::ServeFrom;
/// let cwd = PathBuf::from("/users/shakyshane");
/// let dir = PathBuf::from("/users/kittie/sites/demo");
/// let serve_from = ServeFrom::new(&cwd, &dir);
/// assert_eq!(*serve_from, dir);
/// ```
///
#[derive(Debug, Clone, Default)]
pub struct ServeFrom(PathBuf);

impl ServeFrom {
    pub fn new(cwd: &Path, dir: impl Into<PathBuf>) -> Self {
        let as_pb = dir.into();
        let pb = if as_pb == PathBuf::from(".") {
            cwd.to_path_buf()
        } else {
            cwd.join(as_pb)
        };
        Self(pb)
    }
}

impl Deref for ServeFrom {
    type Target = PathBuf;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl AsRef<OsStr> for ServeFrom {
    fn as_ref(&self) -> &OsStr {
        self.0.as_os_str()
    }
}

impl ServeStatic {
    pub fn from_dir(dir: impl Into<PathBuf>, opts: &Options) -> Self {
        Self {
            mount_path: "/".into(),
            serve_from: ServeFrom::new(&opts.cwd, dir),
            index_file: "index.html".into(),
        }
    }
    pub fn from_dir_routed(dir: impl Into<PathBuf>, mount_path: &str, opts: &Options) -> Self {
        Self {
            mount_path: mount_path.into(),
            serve_from: ServeFrom::new(&opts.cwd, dir),
            index_file: "index.html".into(),
        }
    }
    pub fn from_configs(configs: &[ServeStaticConfig], opts: &Options) -> Vec<Self> {
        configs
            .iter()
            .flat_map(|trailing| match trailing {
                ServeStaticConfig::DirOnly(dir) => vec![ServeStatic::from_dir(dir, opts)],
                ServeStaticConfig::RoutesAndDir(inner) => inner
                    .routes
                    .iter()
                    .map(|r| ServeStatic::from_dir_routed(&inner.dir, r, opts))
                    .collect(),
            })
            .collect()
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
                log::trace!(
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
