use crate::serve_static::ServeStaticConfig;
use clap::Parser;
use std::env::current_dir;
use std::ffi::OsString;
use std::fmt::Formatter;
use std::ops::Deref;
use std::path::PathBuf;
use std::str::FromStr;

#[derive(Parser, Debug, Clone, Default)]
#[clap(author, version, about, long_about = None)]
pub struct Options {
    #[clap(long)]
    serve_static: Option<Vec<ServeStaticConfig>>,

    #[clap(long, default_value_t)]
    pub cwd: Cwd,

    // collect the rest
    trailing: Vec<ServeStaticConfig>,
}

impl Options {
    pub fn try_from_args<Iter, T>(i: Iter) -> Result<Self, clap::Error>
    where
        Iter: IntoIterator<Item = T>,
        T: Into<OsString> + Clone,
    {
        <Self as Parser>::try_parse_from(i)
    }
}

#[derive(Debug, Clone)]
pub struct Cwd(pub PathBuf);

impl Default for Cwd {
    fn default() -> Self {
        Self(current_dir().expect("current_dir"))
    }
}

impl Deref for Cwd {
    type Target = PathBuf;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl std::fmt::Display for Cwd {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0.display())
    }
}

impl FromStr for Cwd {
    type Err = anyhow::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Self(PathBuf::from(s)))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::serve_static::{RoutesAndDir, ServeStaticConfig};
    #[test]
    fn test() -> anyhow::Result<()> {
        let opts = <Options as Parser>::try_parse_from([
            "bs3",
            "--serve-static",
            "fixtures",
            "--serve-static",
            "/node:/node_modules:node_modules",
            "fixtures/alt",
        ])
        .expect("test");
        assert_eq!(
            opts.serve_static,
            Some(vec![
                ServeStaticConfig::DirOnly("fixtures".into()),
                ServeStaticConfig::RoutesAndDir(RoutesAndDir {
                    routes: vec!["/node".to_string(), "/node_modules".to_string(),],
                    dir: "node_modules".into(),
                },),
            ],)
        );
        Ok(())
    }
}
