import AdminLayout from "../layouts/AdminLayout";
import PageHeader from "../components/PageHeader";
import ContentBlockEditorPanel from "../components/ContentBlockEditorPanel";
import "../styles/websiteEditor.css";
import "../styles/beforeAfterEditor.css";

function BeforeAfterEditor() {
  return (
    <AdminLayout>
      <PageHeader
        title="Before / After"
        subtitle="Edit the sliding before-and-after comparison on the Projects page. This is one global showcase — not part of individual project uploads."
      />

      <div className="ba-editor">
        <ContentBlockEditorPanel
          sectionKey="projects-transformation"
          sectionLabel="Before / After slider"
          onPreview={() => {}}
        />
      </div>
    </AdminLayout>
  );
}

export default BeforeAfterEditor;
