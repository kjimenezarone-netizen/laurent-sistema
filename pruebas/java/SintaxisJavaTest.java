import java.nio.file.*;
import java.util.*;
import javax.tools.*;
import com.sun.source.util.JavacTask;

/** Analiza gramática Java sin descargar librerías de Spring. No equivale a compilar. */
public class SintaxisJavaTest {
 public static void main(String[] args) throws Exception {
  var compiler=ToolProvider.getSystemJavaCompiler();
  var diagnostics=new DiagnosticCollector<JavaFileObject>();
  List<java.io.File> sources=new ArrayList<>();
  try(var files=Files.walk(Path.of("backend/src/main/java"))){
   files.filter(p->p.toString().endsWith(".java")).forEach(p->sources.add(p.toFile()));
  }
  try(var fm=compiler.getStandardFileManager(diagnostics,null,null)){
   var units=fm.getJavaFileObjectsFromFiles(sources);
   var task=(JavacTask)compiler.getTask(null,fm,diagnostics,List.of("-proc:none","-Xlint:none"),null,units);
   task.parse();
   long failures=diagnostics.getDiagnostics().stream().filter(d->d.getKind()==Diagnostic.Kind.ERROR).peek(System.err::println).count();
   if(failures>0)throw new AssertionError(failures+" errores sintácticos Java");
  }
  System.out.println("APROBADAS: análisis sintáctico de "+sources.size()+" archivos Java (sin resolver dependencias)");
 }
}
